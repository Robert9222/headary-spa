<?php
/**
 * dump-postgres.php
 * Eksportuje bazę SQLite do pliku .sql kompatybilnego z PostgreSQL.
 * Uruchom z katalogu backend/:
 *   php dump-postgres.php
 */

$dbPath  = __DIR__ . '/database/database.sqlite';
$outDir  = __DIR__ . '/../exports';
$stamp   = date('Ymd-His');
$outFile = "$outDir/postgres-$stamp.sql";

if (!is_dir($outDir)) {
    mkdir($outDir, 0777, true);
}
if (!file_exists($dbPath)) {
    fwrite(STDERR, "Brak pliku bazy: $dbPath\n");
    exit(1);
}

$pdo = new PDO("sqlite:$dbPath");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

/** Mapowanie typu SQLite -> PostgreSQL */
function mapType(string $sqliteType, bool $isPkAutoinc): string {
    if ($isPkAutoinc) return 'BIGSERIAL PRIMARY KEY';
    $t = strtolower(trim($sqliteType));
    // wyciągnij rdzeń typu
    if ($t === '' ) return 'TEXT';
    if (preg_match('/^(varchar|character varying)(\(\d+\))?/', $t, $m)) {
        return 'VARCHAR' . ($m[2] ?? '(255)');
    }
    if (str_starts_with($t, 'char')) return 'CHAR';
    if (str_starts_with($t, 'tinyint(1)') || $t === 'boolean' || $t === 'bool') return 'BOOLEAN';
    if (str_starts_with($t, 'tinyint') || str_starts_with($t, 'smallint')) return 'SMALLINT';
    if (str_starts_with($t, 'mediumint') || str_starts_with($t, 'int') || $t === 'integer') return 'INTEGER';
    if (str_starts_with($t, 'bigint')) return 'BIGINT';
    if (str_starts_with($t, 'float') || str_starts_with($t, 'real') || str_starts_with($t, 'double')) return 'DOUBLE PRECISION';
    if (str_starts_with($t, 'decimal') || str_starts_with($t, 'numeric')) {
        return preg_replace('/^(decimal|numeric)/', 'NUMERIC', $t);
    }
    if ($t === 'date') return 'DATE';
    if (str_starts_with($t, 'datetime') || str_starts_with($t, 'timestamp')) return 'TIMESTAMP';
    if ($t === 'time') return 'TIME';
    if ($t === 'blob' || str_starts_with($t, 'binary') || str_starts_with($t, 'varbinary')) return 'BYTEA';
    if (str_starts_with($t, 'json')) return 'JSONB';
    if (str_starts_with($t, 'text') || str_starts_with($t, 'clob')) return 'TEXT';
    return 'TEXT';
}

function quoteIdent(string $name): string {
    return '"' . str_replace('"', '""', $name) . '"';
}

/** Czy kolumna jest BOOLEAN wg deklaracji typu (do konwersji 0/1 -> true/false) */
function isBoolType(string $sqliteType): bool {
    $t = strtolower(trim($sqliteType));
    return $t === 'boolean' || $t === 'bool' || str_starts_with($t, 'tinyint(1)');
}

/** Pobiera info o tabeli */
function tableInfo(PDO $pdo, string $table): array {
    $cols = $pdo->query("PRAGMA table_info(" . quoteIdent($table) . ")")->fetchAll(PDO::FETCH_ASSOC);
    $fks  = $pdo->query("PRAGMA foreign_key_list(" . quoteIdent($table) . ")")->fetchAll(PDO::FETCH_ASSOC);
    $idx  = $pdo->query("PRAGMA index_list(" . quoteIdent($table) . ")")->fetchAll(PDO::FETCH_ASSOC);
    return ['cols' => $cols, 'fks' => $fks, 'idx' => $idx];
}

/** Wykrywa autoincrement primary key (INTEGER PK w SQLite jest aliasem ROWID) */
function isAutoincrementPk(string $table, array $cols, PDO $pdo): array {
    // znajdź kolumnę PK z jednoelementowym kluczem
    $pkCols = array_values(array_filter($cols, fn($c) => (int)$c['pk'] === 1));
    if (count($pkCols) !== 1) return [false, null];
    $col = $pkCols[0];
    if (strtolower($col['type']) !== 'integer') return [false, null];
    // sprawdź w sqlite_master czy zawiera AUTOINCREMENT
    $sql = $pdo->query("SELECT sql FROM sqlite_master WHERE type='table' AND name=" . $pdo->quote($table))->fetchColumn();
    $hasAutoinc = $sql && stripos($sql, 'autoincrement') !== false;
    // nawet bez słowa AUTOINCREMENT, INTEGER PRIMARY KEY zachowuje się jak autoinkrement
    return [true, $col['name']];
}

$tables = $pdo->query(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
)->fetchAll(PDO::FETCH_COLUMN);

$fh = fopen($outFile, 'w');
if (!$fh) { fwrite(STDERR, "Nie moge zapisac: $outFile\n"); exit(1); }

fwrite($fh, "-- PostgreSQL dump generated " . date('c') . "\n");
fwrite($fh, "-- Source: $dbPath\n");
fwrite($fh, "-- Aby zaimportowac: psql -U <user> -d <baza> -f " . basename($outFile) . "\n\n");
fwrite($fh, "BEGIN;\n");
fwrite($fh, "SET client_min_messages = WARNING;\n\n");

// 1) DROP istniejacych tabel (CASCADE) – wygodne przy czystej instalacji
fwrite($fh, "-- 1) Czyszczenie\n");
foreach ($tables as $t) {
    fwrite($fh, "DROP TABLE IF EXISTS " . quoteIdent($t) . " CASCADE;\n");
}
fwrite($fh, "\n");

// 2) CREATE TABLE (bez FK – FK na koniec)
fwrite($fh, "-- 2) Schemat\n");
$tableMeta = [];
foreach ($tables as $table) {
    $info = tableInfo($pdo, $table);
    [$hasAutoPk, $autoPkCol] = isAutoincrementPk($table, $info['cols'], $pdo);
    $tableMeta[$table] = ['info' => $info, 'autoPkCol' => $autoPkCol];

    $defs = [];
    $pkCols = [];
    foreach ($info['cols'] as $c) {
        $name = $c['name'];
        $type = $c['type'];
        $notNull = (int)$c['notnull'] === 1;
        $default = $c['dflt_value'];
        $isAutoPk = $autoPkCol === $name;

        $pgType = mapType($type, $isAutoPk);
        $line = quoteIdent($name) . ' ' . $pgType;

        if (!$isAutoPk) {
            if ((int)$c['pk'] === 1) $pkCols[] = $name;
            if ($notNull) $line .= ' NOT NULL';
            if ($default !== null) {
                $d = trim($default);
                $du = strtoupper($d);
                if ($du === 'CURRENT_TIMESTAMP' || $du === "CURRENT_TIMESTAMP") {
                    $line .= ' DEFAULT CURRENT_TIMESTAMP';
                } elseif ($du === 'NULL') {
                    // pomin
                } elseif (isBoolType($type) && ($d === '0' || $d === '1')) {
                    $line .= ' DEFAULT ' . ($d === '1' ? 'TRUE' : 'FALSE');
                } else {
                    $line .= ' DEFAULT ' . $d;
                }
            }
        }
        $defs[] = '    ' . $line;
    }
    if ($pkCols && !$autoPkCol) {
        $defs[] = '    PRIMARY KEY (' . implode(',', array_map('quoteIdent', $pkCols)) . ')';
    }

    fwrite($fh, "CREATE TABLE " . quoteIdent($table) . " (\n" . implode(",\n", $defs) . "\n);\n\n");
}

// 3) INDEKSY (poza tymi tworzonymi automatycznie dla PK / unique constraints w sqlite_autoindex)
fwrite($fh, "-- 3) Indeksy\n");
foreach ($tables as $table) {
    $idxs = $pdo->query("SELECT name, sql, \"unique\" FROM sqlite_master WHERE type='index' AND tbl_name=" . $pdo->quote($table) . " AND sql IS NOT NULL")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($idxs as $i) {
        $info = $pdo->query("PRAGMA index_info(" . quoteIdent($i['name']) . ")")->fetchAll(PDO::FETCH_ASSOC);
        if (!$info) continue;
        $cols = implode(',', array_map(fn($r) => quoteIdent($r['name']), $info));
        $unique = stripos($i['sql'], 'unique') !== false ? 'UNIQUE ' : '';
        fwrite($fh, "CREATE {$unique}INDEX " . quoteIdent($i['name']) . " ON " . quoteIdent($table) . " ($cols);\n");
    }
}
fwrite($fh, "\n");

// 4) DANE
fwrite($fh, "-- 4) Dane\n");
$totalRows = 0;
foreach ($tables as $table) {
    $info = $tableMeta[$table]['info'];
    $colDefs = $info['cols'];
    $colNames = array_map(fn($c) => $c['name'], $colDefs);
    $boolCols = [];
    foreach ($colDefs as $c) if (isBoolType($c['type'])) $boolCols[$c['name']] = true;

    $rows = $pdo->query("SELECT * FROM " . quoteIdent($table))->fetchAll(PDO::FETCH_ASSOC);
    if (!$rows) continue;
    fwrite($fh, "-- " . $table . " (" . count($rows) . " rows)\n");
    $colsSql = implode(',', array_map('quoteIdent', $colNames));
    foreach ($rows as $r) {
        $vals = [];
        foreach ($colNames as $cn) {
            $v = $r[$cn] ?? null;
            if ($v === null) { $vals[] = 'NULL'; continue; }
            if (isset($boolCols[$cn])) {
                $vals[] = ((string)$v === '1' || strtolower((string)$v) === 'true' || strtolower((string)$v) === 't') ? 'TRUE' : 'FALSE';
                continue;
            }
            if (is_int($v) || is_float($v)) { $vals[] = $v; continue; }
            // PostgreSQL string literal: pojedyncze apostrofy podwojone
            $vals[] = "'" . str_replace("'", "''", (string)$v) . "'";
        }
        fwrite($fh, "INSERT INTO " . quoteIdent($table) . " ($colsSql) VALUES (" . implode(',', $vals) . ");\n");
        $totalRows++;
    }
    fwrite($fh, "\n");
}

// 5) FOREIGN KEYS
fwrite($fh, "-- 5) Klucze obce\n");
foreach ($tables as $table) {
    $fks = $tableMeta[$table]['info']['fks'];
    if (!$fks) continue;
    // grupuj po id
    $byId = [];
    foreach ($fks as $fk) { $byId[$fk['id']][] = $fk; }
    foreach ($byId as $id => $group) {
        usort($group, fn($a, $b) => $a['seq'] <=> $b['seq']);
        $localCols = array_map(fn($r) => quoteIdent($r['from']), $group);
        $refCols   = array_map(fn($r) => quoteIdent($r['to']),   $group);
        $refTable  = quoteIdent($group[0]['table']);
        $onDelete  = strtoupper($group[0]['on_delete'] ?? 'NO ACTION');
        $onUpdate  = strtoupper($group[0]['on_update'] ?? 'NO ACTION');
        $cname = "fk_{$table}_{$id}";
        fwrite($fh, "ALTER TABLE " . quoteIdent($table)
            . " ADD CONSTRAINT " . quoteIdent($cname)
            . " FOREIGN KEY (" . implode(',', $localCols) . ")"
            . " REFERENCES $refTable (" . implode(',', $refCols) . ")"
            . " ON DELETE $onDelete ON UPDATE $onUpdate;\n");
    }
}
fwrite($fh, "\n");

// 6) Synchronizacja sekwencji dla SERIAL/BIGSERIAL
fwrite($fh, "-- 6) Reset sekwencji autoincrement\n");
foreach ($tables as $table) {
    $autoPkCol = $tableMeta[$table]['autoPkCol'];
    if (!$autoPkCol) continue;
    $seq = $table . '_' . $autoPkCol . '_seq';
    fwrite($fh, "SELECT setval('" . str_replace("'", "''", $seq) . "', COALESCE((SELECT MAX(" . quoteIdent($autoPkCol) . ") FROM " . quoteIdent($table) . "), 1), true);\n");
}
fwrite($fh, "\nCOMMIT;\n");

fclose($fh);

$size = number_format(filesize($outFile) / 1024, 1);
echo "OK: $outFile ($size KB, tabel: " . count($tables) . ", wierszy: $totalRows)\n";


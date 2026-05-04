<?php
$p = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
foreach ($p->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")->fetchAll(PDO::FETCH_COLUMN) as $t) {
    $n = $p->query('SELECT COUNT(*) FROM "' . $t . '"')->fetchColumn();
    echo str_pad($t, 30) . ' ' . $n . PHP_EOL;
}


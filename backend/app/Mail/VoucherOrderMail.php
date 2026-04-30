<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Queue\SerializesModels;

class VoucherOrderMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function envelope(): Envelope
    {
        // Keep the technical From: as the salon's authenticated address
        // (anything else would be rejected by Gmail/Outlook as spoofing),
        // but use the customer's name as the display name so in the inbox
        // it visibly looks like the message comes from the customer.
        // Reply-To points to the customer, so a single click "Reply" reaches them.
        $fromAddress = config('mail.from.address');
        $customerName = trim((string) ($this->data['sender_name'] ?? ''));
        $customerEmail = trim((string) ($this->data['sender_email'] ?? ''));
        $displayName = $customerName !== ''
            ? "{$customerName} (Voucher order)"
            : 'Voucher order';

        return new Envelope(
            from: new Address($fromAddress, $displayName),
            subject: '🎁 New gift voucher order - ' . $this->data['recipient_name']
                . ($customerName !== '' ? ' (from ' . $customerName . ')' : ''),
            replyTo: [
                new Address($customerEmail !== '' ? $customerEmail : $fromAddress, $customerName !== '' ? $customerName : 'Customer'),
            ],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.voucher-order',
            with: ['data' => $this->data],
        );
    }
}


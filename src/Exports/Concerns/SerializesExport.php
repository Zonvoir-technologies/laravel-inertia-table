<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Exports\Concerns;

trait SerializesExport
{
    public function toArray(): array
    {
        return [
            'key' => $this->keyName(),
            'label' => $this->label,
            'endpoint' => route('zonvoir-table.exports.execute', absolute: false),
            'authorized' => true,
            'hidden' => false,
            'disabled' => false,
            'queued' => $this->queued,
            'limitToFilteredRows' => $this->limitToFilteredRows,
            'limitToSelectedRows' => $this->limitToSelectedRows,
            'asDownload' => $this->shouldDownload(),
            'meta' => $this->meta,
            'data' => $this->data,
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}

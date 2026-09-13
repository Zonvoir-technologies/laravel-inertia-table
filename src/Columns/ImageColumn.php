<?php

declare(strict_types=1);

namespace Zonvoir\InertiaTable\Columns;

final class ImageColumn extends Column
{
    protected function __construct(string $name)
    {
        parent::__construct($name);

        $this->image($name);
    }
    public function imageWidth(int|string $width): ImageColumn
    {
        return $this->meta([
            'imageWidth' => $width,
        ]);
    }

    public function imageHeight(int|string $height): ImageColumn
    {
        return $this->meta([
            'imageHeight' => $height,
        ]);
    }

    public function shape(string $shape): ImageColumn
    {
        return $this->meta([
            'shape' => $shape,
        ]);
    }

    public function rounded(): ImageColumn
    {
        return $this->shape('rounded');
    }

    public function circle(): ImageColumn
    {
        return $this->shape('circle');
    }

    public function fit(string $fit): ImageColumn
    {
        return $this->meta([
            'fit' => $fit,
        ]);
    }

    public function alt(string $alt): ImageColumn
    {
        return $this->meta([
            'alt' => $alt,
        ]);
    }

    public function placeholder(string $placeholder): ImageColumn
    {
        return $this->meta([
            'placeholder' => $placeholder,
        ]);
    }

}

<?php

declare(strict_types=1);

namespace Tests\Unit\Rules;

use App\Rules\Cpf;
use Illuminate\Support\Facades\Validator;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class CpfTest extends TestCase
{
    #[DataProvider('validCpfs')]
    public function test_accepts_valid_cpf(string $cpf): void
    {
        $validator = Validator::make(['cpf' => $cpf], ['cpf' => [new Cpf]]);

        $this->assertTrue($validator->passes());
    }

    #[DataProvider('invalidCpfs')]
    public function test_rejects_invalid_cpf(string $cpf): void
    {
        $validator = Validator::make(['cpf' => $cpf], ['cpf' => [new Cpf]]);

        $this->assertTrue($validator->fails());
    }

    public static function validCpfs(): iterable
    {
        yield ['52998224725'];
        yield ['11144477735'];
        yield ['14475013062'];
        yield ['34602380891'];
        yield ['39596976605'];
        yield ['44378383276'];
        yield ['61389978087'];
        yield ['77124891302'];
        yield ['91925508439'];
        yield ['98678831790'];
    }

    public static function invalidCpfs(): iterable
    {
        yield ['11111111111'];
        yield ['52998224724'];
        yield ['12345678900'];
    }
}

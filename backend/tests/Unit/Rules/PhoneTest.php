<?php

declare(strict_types=1);

namespace Tests\Unit\Rules;

use App\Rules\Phone;
use Illuminate\Support\Facades\Validator;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PhoneTest extends TestCase
{
    #[DataProvider('validPhones')]
    public function test_accepts_valid_brazilian_mobile_phone(string $phone): void
    {
        $validator = Validator::make(['phone' => $phone], ['phone' => [new Phone]]);

        $this->assertTrue($validator->passes());
    }

    #[DataProvider('invalidPhones')]
    public function test_rejects_invalid_phone(string $phone): void
    {
        $validator = Validator::make(['phone' => $phone], ['phone' => [new Phone]]);

        $this->assertTrue($validator->fails());
    }

    public static function validPhones(): iterable
    {
        yield 'national' => ['11999998888'];
        yield 'country code' => ['5511999998888'];
        yield 'formatted' => ['+55 (11) 99999-8888'];
    }

    public static function invalidPhones(): iterable
    {
        yield 'landline' => ['+55 (11) 3333-4444'];
        yield 'invalid area code' => ['5501999998888'];
        yield 'too short' => ['1199999888'];
        yield 'letters' => ['phone-number'];
        yield 'letters with valid digits' => ['phone 5511999998888'];
    }
}

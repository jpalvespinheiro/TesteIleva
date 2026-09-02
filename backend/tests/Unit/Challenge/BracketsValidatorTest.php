<?php

declare(strict_types=1);

namespace Tests\Unit\Challenge;

use App\Challenge\BracketsValidator;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class BracketsValidatorTest extends TestCase
{
    #[DataProvider('validSequences')]
    public function test_accepts_balanced_sequences(string $input): void
    {
        self::assertTrue((new BracketsValidator)->isValid($input));
    }

    #[DataProvider('invalidSequences')]
    public function test_rejects_unbalanced_or_unsupported_sequences(string $input): void
    {
        self::assertFalse((new BracketsValidator)->isValid($input));
    }

    public static function validSequences(): iterable
    {
        yield 'empty' => [''];
        yield 'adjacent pairs' => ['(){}[]'];
        yield 'nested and adjacent' => ['[{()}](){}'];
        yield 'deeply nested' => ['{{[[(())]]}}'];
    }

    public static function invalidSequences(): iterable
    {
        yield 'missing closing bracket' => ['[]{()'];
        yield 'wrong closing order' => ['[{)]'];
        yield 'closing bracket first' => [']'];
        yield 'opening brackets only' => ['[[['];
        yield 'unsupported character' => ['(a)'];
    }
}

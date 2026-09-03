<?php

declare(strict_types=1);

return [
    'array' => 'O campo :attribute deve ser uma lista.',
    'between' => [
        'numeric' => 'O campo :attribute deve estar entre :min e :max.',
    ],
    'email' => 'O campo :attribute deve conter um e-mail válido.',
    'enum' => 'O valor selecionado para :attribute é inválido.',
    'integer' => 'O campo :attribute deve ser um número inteiro.',
    'max' => [
        'string' => 'O campo :attribute não pode ter mais de :max caracteres.',
    ],
    'min' => [
        'numeric' => 'O campo :attribute deve ser pelo menos :min.',
    ],
    'regex' => 'O formato do campo :attribute é inválido.',
    'required' => 'O campo :attribute é obrigatório.',
    'required_with' => 'O campo :attribute é obrigatório quando :values está presente.',
    'string' => 'O campo :attribute deve ser um texto.',
    'unique' => 'O valor informado para :attribute já está cadastrado.',
    'custom' => [
        'cpf' => [
            'unique' => 'O CPF informado já está cadastrado.',
        ],
        'value' => [
            'unique' => 'Este contato já está cadastrado para a pessoa.',
        ],
    ],
    'attributes' => [
        'address' => 'endereço',
        'address.cep' => 'CEP',
        'address.complement' => 'complemento',
        'address.number' => 'número',
        'cpf' => 'CPF',
        'name' => 'nome completo',
        'page' => 'página',
        'per_page' => 'itens por página',
        'phone' => 'celular',
        'type' => 'tipo',
        'value' => 'contato',
    ],
];

<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Person;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $people = [
            ['Ana Souza', '14475013062', '5511900000001', '01001000', 'Praça da Sé', '100', null, 'Sé', 'São Paulo', 'SP'],
            ['Bruno Lima', '34602380891', '5521900000002', '20040002', 'Rua São José', '200', 'Apto 12', 'Centro', 'Rio de Janeiro', 'RJ'],
            ['Camila Oliveira', '39596976605', '5531900000003', '30140071', 'Avenida Afonso Pena', '300', 'Sala 5', 'Centro', 'Belo Horizonte', 'MG'],
            ['Diego Santos', '44378383276', '5561900000004', '70040900', 'Praça dos Três Poderes', '400', null, 'Zona Cívico-Administrativa', 'Brasília', 'DF'],
            ['Fernanda Almeida', '61389978087', '5541900000005', '80010000', 'Rua José Loureiro', '500', 'Casa 2', 'Centro', 'Curitiba', 'PR'],
            ['Gabriel Costa', '77124891302', '5551900000006', '90010000', 'Praça Marechal Deodoro', '600', null, 'Centro Histórico', 'Porto Alegre', 'RS'],
            ['Juliana Rocha', '91925508439', '5571900000007', '40020000', 'Rua Chile', '700', 'Bloco B', 'Centro', 'Salvador', 'BA'],
            ['Lucas Martins', '98678831790', '5581900000008', '50010000', 'Avenida Marquês de Olinda', '800', null, 'Recife', 'Recife', 'PE'],
        ];

        foreach ($people as $index => $data) {
            $person = Person::query()->create([
                'name' => $data[0],
                'cpf' => $data[1],
                'phone' => $data[2],
            ]);

            $person->address()->create([
                'cep' => $data[3],
                'street' => $data[4],
                'number' => $data[5],
                'complement' => $data[6],
                'neighborhood' => $data[7],
                'city' => $data[8],
                'state' => $data[9],
            ]);

            $suffix = str_pad((string) ($index + 1), 8, '0', STR_PAD_LEFT);

            $person->contacts()->createMany([
                ['type' => 'email', 'value' => 'pessoa'.($index + 1).'@example.com'],
                ['type' => 'phone', 'value' => '+55119'.$suffix],
                ['type' => 'whatsapp', 'value' => '+55219'.$suffix],
            ]);
        }
    }
}

---
title: Política de compensação
description: Regras de cobrança para uso acumulado, tolerância de excedente e limites mensais de operações.
---

Esta política explica como a TerraScale lida com operações não usadas, reinícios mensais e pequenos excedentes. O objetivo é simples: dar previsibilidade de cobrança sem interromper cargas saudáveis.

> Nota: esta página mantém a URL legada `/reference/compesation/` por compatibilidade com links existentes.

## O que é rollover de uso

Se o seu plano inclui uma franquia mensal de operações e você não usa tudo, a parte não utilizada passa para o mês seguinte.

O rollover dá mais flexibilidade para padrões de tráfego irregulares. Ele foi pensado para variações normais de um mês para outro, não como substituto permanente para migrar para um plano maior.

## Como o rollover funciona

A TerraScale aplica primeiro as operações incluídas no mês atual. Depois disso, qualquer operação não utilizada que veio do mês anterior é consumida.

O rollover vale por apenas um ciclo adicional de cobrança.

### Regras de rollover

- Operações incluídas não usadas passam para o mês seguinte.
- O uso do mês atual é consumido antes do uso acumulado.
- Qualquer valor acumulado expira no fim do mês seguinte se não for usado.
- O rollover não se acumula indefinidamente por vários meses.

## Política de uso excedente

A TerraScale não bloqueia requisições de forma rígida por padrão quando você ultrapassa as operações mensais incluídas.

Em vez disso, aplicamos a política abaixo:

- Avisamos você quando o uso ultrapassa a franquia mensal do plano.
- Uso de até 20% acima da franquia mensal é tolerado sem cobrança de excedente.
- Se o uso ultrapassar essa tolerância de 20% dentro de um único mês de cobrança, o excedente pode ser cobrado separadamente.
- Se detectarmos excedentes repetidos que indiquem que sua carga não cabe mais no plano, poderemos pedir que você faça upgrade.
- Se as configurações da sua conta permitirem, você pode desativar excedentes e bloquear requisições extras.

## Exemplos

### Exemplo 1: uso total do mês atual, uso parcial do rollover

Suponha que um plano inclua 10 milhões de operações por mês.

| Month | Included operations | Rolled in from previous month | Total available | Operations used | Rollover to next month |
| --- | ---: | ---: | ---: | ---: | ---: |
| January | 10 million | 0 | 10 million | 1 million | 9 million |
| February | 10 million | 9 million | 19 million | 12 million | 0 |
| March | 10 million | 0 | 10 million | Depends on March usage | Depends on March usage |

Neste cenário, os 9 milhões de operações não usadas de janeiro passam para fevereiro. Fevereiro usa primeiro seus próprios 10 milhões incluídos e depois 2 milhões do rollover. Os 7 milhões restantes de janeiro expiram no fim de fevereiro.

### Exemplo 2: rollover depois de um mês leve

Suponha que o mesmo plano inclua 10 milhões de operações por mês.

| Month | Included operations | Rolled in from previous month | Total available | Operations used | Rollover to next month |
| --- | ---: | ---: | ---: | ---: | ---: |
| January | 10 million | 0 | 10 million | 5 million | 5 million |
| February | 10 million | 5 million | 15 million | 2 million | 8 million |
| March | 10 million | 8 million | 18 million | Depends on March usage | Depends on March usage |

Aqui, fevereiro usa apenas 2 milhões de seus 10 milhões incluídos. Como os 5 milhões acumulados de janeiro não foram necessários, eles expiram no fim de fevereiro. Março recebe a parte não usada de fevereiro, 8 milhões.

### Exemplo 3: tolerância de excedente

Suponha que um plano inclua 1 milhão de operações por mês.

| Monthly allowance | Usage | Percent over plan | Result |
| ---: | ---: | ---: | --- |
| 1 million | 1.1 million | 10% | Apenas aviso, sem cobrança de excedente |
| 1 million | 1.2 million | 20% | Apenas aviso, sem cobrança de excedente |
| 1 million | 1.25 million | 25% | Pode haver cobrança de excedente separada |

## Relacionado

- [Pricing](/reference/pricing/)
- [Plans](/reference/plans/)
- [Billing](/reference/billing/)
- [Rate Limits](/reference/rate-limits/)


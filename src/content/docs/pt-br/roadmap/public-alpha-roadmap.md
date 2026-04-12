---
title: Roteiro do Alfa Público
description: Melhorias planejadas para a TerraScale durante o Alfa Público, incluindo automação de desempenho e limites maiores por banco de dados.
draft: true
sidebar:
  order: 3
---

Esta página cobre as principais melhorias planejadas durante o Alfa Público. O foco é direto: tornar a TerraScale mais rápida de adotar, mais fácil de ajustar e mais capaz sob cargas de trabalho reais.

Para a visão completa do produto, veja o [Roteiro Público](/roadmap/). Para o estágio de lançamento atual, veja [Alfa Público](/roadmap/public-alpha/).

## Visão Geral

O Alfa Público já pode ser usado, mas várias melhorias importantes ainda estão por vir. O roteiro desta etapa está centrado em automação de desempenho, melhor comportamento de cache e mais espaço para crescer antes que as equipes precisem pensar nos limites de tamanho do banco de dados.

## Recursos Planejados

### Indexação Automática

A TerraScale planeja criar automaticamente índices para campos consultados com frequência. O objetivo é reduzir o ajuste manual e ajudar as cargas de trabalho a atingir um bom desempenho mais cedo, especialmente para equipes que ainda estão aprendendo seus padrões de consulta.

### Cache Automático com Invalidação

O cache automático de resultados de consulta está planejado para melhorar o desempenho de leitura sem exigir que as equipes gerenciem manualmente cada decisão de cache. A invalidação de cache faz parte do design para manter os resultados em cache alinhados às mudanças nos dados subjacentes.

### Aumento do Limite de Armazenamento

O limite atual do Alfa Público é de 100 GB por banco de dados. O roteiro inclui aumentar esse limite para 500 GB por banco de dados, para que cargas de trabalho iniciais maiores possam permanecer na plataforma sem atingir esse limite atual tão rapidamente.

### Controles Manuais de Cache

Junto com o cache automático, a TerraScale planeja adicionar controles manuais de cache para equipes que querem um controle mais rígido sobre o comportamento. Isso inclui remoção LRU e gerenciamento explícito de cache para cargas de trabalho que precisam de ajustes previsíveis.

## Observações sobre o Cronograma

Este roteiro é priorizado pelo feedback dos usuários e por padrões reais de uso. Ainda não existem datas públicas fixas, e a ordem pode mudar à medida que a equipe aprende mais com cargas de trabalho semelhantes à produção durante o Alfa Público.

## Solicite um Recurso

Quer influenciar o roteiro? Entre na [comunidade do Discord](https://discord.gg/8Zr2Nw9g) e compartilhe o que sua carga de trabalho precisa em seguida.

Para solicitações diretas ou perguntas de acompanhamento, envie um e-mail para [support@terrascale.com](mailto:support@terrascale.com).

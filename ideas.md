# Brainstorm de Design - Calculadora IRPF Numer Contabilidade

## Contexto
Ferramenta interna para contadores da Numer orçarem declarações de IRPF 2026. Identidade visual: laranja, branco e cinza claro. Uso profissional diário.

---

<response>
<idea>

## Ideia 1 - "Corporate Dashboard Moderno"

**Design Movement**: Material Design 3 com influência de dashboards SaaS corporativos (Stripe, Linear)

**Core Principles**:
1. Hierarquia visual clara com cards elevados e espaçamento generoso
2. Funcionalidade acima de tudo — cada elemento tem propósito
3. Micro-interações que guiam o fluxo de trabalho
4. Densidade de informação controlada

**Color Philosophy**: Laranja (#F57C20) como cor de ação e destaque, fundo branco puro para área de trabalho, cinza claro (#F5F5F7) para painéis laterais, cinza médio (#6B7280) para texto secundário. O laranja transmite energia e confiança — valores da Numer.

**Layout Paradigm**: Layout em duas colunas — formulário à esquerda, painel de resultado fixo à direita (sticky). Em mobile, resultado aparece como bottom sheet.

**Signature Elements**:
1. Cards com borda sutil e sombra suave (shadow-sm)
2. Badges de complexidade com gradiente laranja
3. Barra de progresso segmentada no topo

**Interaction Philosophy**: Feedback imediato — ao marcar cada checkbox, o valor atualiza em tempo real no painel lateral. Transições suaves de 200ms.

**Animation**: Fade-in nos cards ao entrar, counter animation no valor total, pulse suave no badge de complexidade ao mudar.

**Typography System**: Sora (headings, bold 600-700) + DM Sans (body, regular 400-500). Tamanhos: H1 28px, H2 20px, body 15px, caption 13px.

</idea>
<probability>0.08</probability>
<text>Dashboard corporativo moderno com layout em duas colunas, resultado em tempo real, e estética SaaS premium.</text>
</response>

---

<response>
<idea>

## Ideia 2 - "Warm Professional Wizard"

**Design Movement**: Scandinavian Minimalism com toques de warmth corporativo brasileiro

**Core Principles**:
1. Simplicidade radical — uma pergunta por vez, sem sobrecarregar
2. Calor humano através das cores e formas arredondadas
3. Progressão clara com senso de conquista a cada etapa
4. Espaço negativo como elemento de design

**Color Philosophy**: Laranja quente (#FF8C2E) em gradiente sutil para botões e destaques, fundo off-white (#FAFAF8) que é mais acolhedor que branco puro, cinza quente (#8C8C88) para texto secundário. A paleta transmite acessibilidade e profissionalismo sem frieza.

**Layout Paradigm**: Wizard centralizado em tela cheia, uma seção por vez com scroll suave. Cada seção ocupa no mínimo 60vh. Resultado final como página dedicada.

**Signature Elements**:
1. Círculos de progresso numerados com preenchimento laranja
2. Ícones ilustrativos em cada seção (estilo line-art)
3. Transição de slide entre etapas

**Interaction Philosophy**: Step-by-step guiado. Cada seção tem botão "Próximo" que desliza suavemente. Sensação de formulário inteligente.

**Animation**: Slide horizontal entre etapas, scale-up nos checkboxes ao marcar, confetti sutil no resultado final.

**Typography System**: Plus Jakarta Sans (headings, 600-800) + Inter (body, 400-500). Tamanhos generosos: H1 32px, H2 24px, body 16px.

</idea>
<probability>0.06</probability>
<text>Wizard minimalista escandinavo com progressão step-by-step, cores quentes e sensação acolhedora.</text>
</response>

---

<response>
<idea>

## Ideia 3 - "Compact Power Tool"

**Design Movement**: Notion/Linear-inspired utility design — ferramentas de produtividade densas mas elegantes

**Core Principles**:
1. Tudo visível em uma única tela — sem scroll desnecessário
2. Densidade inteligente de informação
3. Atalhos e eficiência para uso repetitivo diário
4. Contraste forte para legibilidade rápida

**Color Philosophy**: Laranja vibrante (#F97316) apenas para CTAs e indicadores críticos, fundo cinza muito claro (#F8FAFC) com cards brancos, bordas cinza (#E2E8F0). Uso econômico da cor — quando o laranja aparece, ele importa.

**Layout Paradigm**: Grid compacto em 3 colunas no desktop — dados do cliente (col 1), checklist completo (col 2), resultado + proposta (col 3). Tudo acima da dobra.

**Signature Elements**:
1. Toggle switches compactos em vez de checkboxes
2. Contador numérico animado no painel de resultado
3. Sidebar colapsável com histórico de orçamentos

**Interaction Philosophy**: Zero fricção — tudo clicável, sem modais, sem etapas. Resultado atualiza instantaneamente. Otimizado para mouse e teclado.

**Animation**: Apenas micro-animações funcionais — number tween no valor, color transition no badge de complexidade, tooltip on hover.

**Typography System**: Geist Sans (headings e body, 400-700) — fonte única para máxima coesão. Tamanhos compactos: H1 24px, H2 18px, body 14px, caption 12px.

</idea>
<probability>0.07</probability>
<text>Ferramenta compacta estilo Notion/Linear, tudo em uma tela, otimizada para uso repetitivo diário.</text>
</response>

---

## Decisão

**Escolha: Ideia 1 - "Corporate Dashboard Moderno"**

Justificativa: Para uma ferramenta interna de uso profissional, o layout em duas colunas com resultado em tempo real oferece a melhor experiência. O contador vê imediatamente o impacto de cada marcação no orçamento. A estética SaaS premium reforça a identidade profissional da Numer, e o design é funcional sem sacrificar elegância. A tipografia Sora + DM Sans traz personalidade sem perder legibilidade.

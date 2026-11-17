# Filling · Painel Real

Checklist diária da sequência Filling, agenda de caminhões por horário e preparo das 7 etapas por caminhão.

- **Hoje** — sequência colorida por etapa, próximo passo (inclusive caminhão por caminhão), caminhões do dia com chegada/início/fim.
- **Agenda** — régua do dia (previsto × real), janelas por turno, **horário imprevisto** fora da lista, reprocesso e OS por caminhão, **Ajustar horário** com motivo e opção de empurrar os seguintes.
- **Preparo** — confirme as etapas 1 a 1 por caminhão, ou cada etapa em todos de uma vez.
- **Histórico** — conclusão da sequência e atraso médio de chegada.
Funciona no PC e no celular, salva tudo no próprio navegador e funciona offline.

## Atalhos do teclado (PC)

`1`–`4` abas · `←` `→` dia anterior/próximo · `H` hoje · `C` concluir próximo passo · `E` confirmar etapa em todos · `N` novo caminhão · `I` horário imprevisto · `R` chegada/iniciar/finalizar o próximo · `A` ajustar horário · `Z` desfazer · `T` tema · `,` configurações · `Ctrl+Enter` salvar · `?` ajuda

## Aparência

Em ⚙️ Configurações: temas *Noite Real*, *Pergaminho*, *Carmesim Imperial* e *Cavaleiro Negro*, cor de destaque (ouro, prata, rubi, ametista), densidade compacta, tamanho da letra e seu nome na saudação.

## Publicar no GitHub Pages

1. Crie um repositório novo no GitHub (ex.: `filling-painel`).
2. Envie **todos** os arquivos desta pasta (incluindo a pasta `icons/`) para a raiz do repositório
   — pelo site: *Add file → Upload files* e arraste tudo.
3. Vá em **Settings → Pages**, em *Source* escolha **Deploy from a branch**, branch `main`, pasta `/ (root)` → **Save**.
4. Em 1–2 minutos o site fica em `https://SEU-USUARIO.github.io/filling-painel/`.

No celular, abra o link e use **Adicionar à tela inicial** para usar como aplicativo.

## Sobre os dados

- Ficam salvos no `localStorage` de cada navegador (PC e celular têm dados separados).
- Use ⚙️ → **Exportar / Importar** para levar o backup de um aparelho para outro.
- A sequência zera sozinha a cada dia; os dias anteriores ficam no **Histórico**.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Estrutura da página |
| `style.css` | Visual (tema claro/escuro, responsivo) |
| `app.js` | Lógica: checklist, janelas, histórico — as etapas e tipos de envase ficam no topo do arquivo, fáceis de editar |
| `sw.js`, `manifest.webmanifest`, `icons/` | Modo aplicativo/offline |

## Atualizar para uma versão nova

Substitua todos os arquivos no repositório. Os arquivos levam um número de versão (`?v=5` no `index.html` e `filling-v5` no `sw.js`), então o navegador busca tudo novo de uma vez. Se mesmo assim algo parecer antigo, feche e abra a página de novo.

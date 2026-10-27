# Galdino's Estética Automotiva — landing page

Site estático (HTML + CSS + JS, sem build e sem dependências). Pronto para GitHub + Vercel.

## Rodar localmente

```bash
python3 -m http.server 8080
# abra http://localhost:8080
```

## Publicar na Vercel

Importe o repositório na Vercel com o preset **Other** (sem comando de build, diretório raiz `/`).
O `vercel.json` já define cache longo para imagens e vídeos.

## Estrutura

```
index.html            página única (SEO, Open Graph, seções)
assets/css/site.css   tokens de cor/tipo no :root + componentes
assets/js/site.js     menu, revelações, carrosséis, vídeos, lightbox, status "aberto agora", mapa
assets/img/           fotos 4:5 em WebP (640 e 1080/720 px), pôsteres dos vídeos, logo
assets/video/         19 vídeos 4:5, 720×900, H.264 sem áudio
```

## Onde editar

| O quê | Onde |
|---|---|
| Número do WhatsApp das mensagens por serviço | `CONFIG.whatsappNumber` em `assets/js/site.js` |
| Link oficial de agendamento | busque `api.whatsapp.com/message/K7VR3NWIOAEHK1` no `index.html` |
| Horário e status "aberto agora" | `CONFIG.open` em `site.js` + tabela em `#contato` |
| Coordenadas do mapa | `CONFIG.map` em `site.js` e `data-lat/data-lng` no `index.html` |
| Domínio final | `<link rel="canonical">` no `index.html` |

## Decisões de arquitetura

- **Estático puro**: uma página, zero build. Carrega rápido, custa nada na Vercel e qualquer pessoa edita.
- **Mapa**: uma camada própria com o pin 3D pulsante fica sempre visível; o Google Maps (embed sem chave de API) entra por cima quando a seção aparece. O mapa fica travado para não sequestrar a rolagem; o botão "Mover o mapa" libera.
- **WhatsApp**: sem JavaScript, todos os botões usam o link oficial. Com JavaScript, os botões de serviço viram `wa.me` com mensagem pronta.
- **Vídeos**: `preload="none"` + pôster; só tocam (mudos) quando 60% do card está visível.
- **Movimento**: tudo em `transform`/`opacity`/`clip-path`; desligado com `prefers-reduced-motion`.

## Tratamento de mídia

Todas as fotos e vídeos foram recortados em 4:5 de forma simétrica, sem distorção e sem alterar rostos.
As legendas sobrepostas foram eliminadas **por recorte** (nenhum preenchimento artificial, logo nenhum borrão).
A fachada diurna mantém o enquadramento original 5:4 para o letreiro aparecer inteiro.

# Cambridge Radar — сайт

Публічний сайт [cambridge-radar.com](https://cambridge-radar.com). Next.js 16 (App Router) + Tailwind CSS 4,
увесь контент — із Sanity (адмінка: репозиторій **cambridge-radar-admin**).

> Документ для розробників. Інструкція для редакції — окремий PDF «Інструкція з користування сайтом».

## Сервіси та доступи

| Що | Де | Примітка |
|---|---|---|
| Код сайту | GitHub: `cambridge-radar-frontend` | `[посилання на репозиторій клієнта]` |
| Код адмінки | GitHub: `cambridge-radar-admin` | `[посилання на репозиторій клієнта]` |
| Хостинг сайту | Vercel, проєкт `cambridge-radar-frontend` | вхід через GitHub |
| Контент і адмінка | Sanity, проєкт `polcbwiw`, датасет `production` | sanity.io/manage |
| Домен | `[реєстратор]` | DNS → Vercel |
| Листи (розсилка, форми) | Resend | `[після підключення]` |
| Захист форм від спаму | Cloudflare Turnstile | необовʼязково |

Розробнику доступ видається запрошенням у GitHub / Vercel / Sanity, а не паролями від акаунтів.

## Запуск

```bash
npm install
cp .env.example .env.local   # заповнити (див. нижче)
npm run dev                  # http://localhost:3000
npm run build && npm start   # продакшн-збірка локально
```

## Змінні середовища

| Змінна | Для чого |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | проєкт і датасет Sanity (`polcbwiw` / `production`) |
| `NEXT_PUBLIC_SITE_URL` | адреса сайту для canonical, sitemap, OG |
| `NEXT_PUBLIC_NOINDEX` | `1` — закрити сайт від індексації (тестові домени) |
| `SANITY_WRITE_TOKEN` | запис підписників і повідомлень із форм |
| `SANITY_REVALIDATE_SECRET` | секрет вебхука Sanity → `/api/revalidate` |
| `RESEND_API_KEY`, `EMAIL_FROM` | листи: підтвердження підписки, розсилка статей, листи з форм |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile на формах |

Без Resend і Turnstile форми працюють: усе зберігається в Sanity, листи просто не надсилаються,
від спаму захищають honeypot і ліміт запитів.

## Як це працює

- **Сторінки статичні й кешовані.** Усі запити до Sanity мають тег `sanity`. Після «Опублікувати»
  Sanity викликає вебхук `/api/revalidate`, кеш скидається, наступний відвідувач бачить нову версію
  (секунди). Резерв — автоматичне оновлення раз на годину (так зʼявляються й статті з майбутньою датою).
- **Нова стаття / розділ / тег** рендеряться при першому відкритті й далі кешуються.
- **Розсилка:** вебхук на першу публікацію статті надсилає лист активним підписникам (один раз,
  лише для свіжих статей; вимикається в Налаштуваннях сайту → Розсилка).
- **Переадресації:** фіксовані шаблони старого WordPress — у `next.config.ts`; правила редакції з Sanity
  застосовує `src/proxy.ts` під час роботи (оновлює список раз на хвилину), тому деплой не потрібен.
- **Зображення** — через CDN Sanity (`src/lib/sanity/image-loader.ts`): потрібний розмір, AVIF/WebP,
  кадрування й фокус із адмінки.
- **Тема день/ніч** — `data-theme` на `<html>`, ставиться до першого кадру.
- **Аналітика** вантажиться лише після згоди на cookies; ID задаються в адмінці.

## Карта проєкту

| Шлях | Що там |
|---|---|
| `src/app/page.tsx` | Головна |
| `src/app/[slug]/page.tsx` | Розділ (`/leadership`) або сторінка (`/about`) — спільний простір адрес |
| `src/app/[slug]/[article]/page.tsx` | Стаття |
| `src/app/[slug]/page/[n]` · `src/app/all` · `src/app/tag` | Пагінація розділу, архів усіх статей, сторінки тем |
| `src/app/authors` | Сторінка авторів і профілі |
| `src/app/search` · `src/app/not-found.tsx` | Пошук і 404 |
| `src/app/api/*` | Форми (`contact`, `subscribe`, `unsubscribe`) і вебхук `revalidate` |
| `src/app/sitemap.ts` · `robots.ts` · `rss.xml` · `llms*.txt` · `opengraph-image.tsx` | SEO-файли |
| `src/proxy.ts` | Переадресації з Sanity + прибирання слеша в кінці адреси |
| `src/components/layout/*` | Шапка, меню, футер, пошук, плаваючі кнопки (підписка, доступність) |
| `src/components/article/*` | Текст статті, зміст, поширення, автор, попередня/наступна |
| `src/components/home/*` · `section/*` · `story/*` | Блоки головної, сторінки розділу, картки статей |
| `src/components/page/PageView.tsx` | Статичні сторінки та їхні форми |
| `src/components/consent/*` · `analytics/*` | Cookie-банер і події аналітики |
| `src/lib/sanity/queries.ts` · `types.ts` | Усі GROQ-запити і типи даних |
| `src/lib/data.ts` | Спільні запити (налаштування, найновіші, Daily Feed) |
| `src/lib/server/*` | Листи (Resend), захист форм |
| `src/app/globals.css` | Дизайн-токени (кольори, шрифти, сітка, відступи) і стилі тексту |

## Типові правки

- **Кольори, шрифти, відступи** — змінні в `:root` і `@theme` у `globals.css`. Компоненти використовують
  лише токени (`t-h1`, `meta`, `mt-block`…), окремих розмірів у компонентах немає.
- **Нове поле в адмінці → на сайті:** поле в схемі (репозиторій адмінки) → додати його в запит у
  `queries.ts` і тип у `types.ts` → вивести в компоненті.
- **Шапка / меню / футер** — `src/components/layout/`. Пункти меню редагуються в адмінці, не в коді.
- **Тексти листів** — `src/lib/server/email.ts` і `src/app/api/*`.
- **Нова сторінка-шаблон** — значення в полі «Що ще є на сторінці» (адмінка) + гілка в `PageView.tsx`.

Пастки, на які вже наступали:
- не використовувати клас `inline-block`: токен відступів `block` змушує Tailwind додати
  `.inline-block { inline-size: … }`;
- липкі панелі мають суцільний фон без `backdrop-filter` (Safari 26 на iPhone);
- нічого не має виходити за ширину екрана: перевіряти на 360 і 412 px.

## Деплой

Vercel. Якщо репозиторій підключено до проєкту у Vercel — кожен push у `main` деплоїться сам.
Вручну: `npx vercel deploy --prod`. Змінні середовища — у Vercel → Project → Settings → Environment
Variables. Тестові деплої: `NEXT_PUBLIC_NOINDEX=1`.

## Вебхук Sanity

sanity.io/manage → проєкт → API → Webhooks:
URL `https://<домен>/api/revalidate`, усі документи, create/update/delete, projection `{_id, _type}`,
secret = `SANITY_REVALIDATE_SECRET`.

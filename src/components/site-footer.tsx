import Link from "next/link";

const footerGroups = [
  {
    title: "Компания",
    links: [
      ["О нас", "/about"],
      ["Проекты", "/projects"],
      ["Статьи", "/articles"],
    ],
  },
  {
    title: "Услуги",
    links: [
      ["Разработка", "/services"],
      ["Тестирование", "/services"],
      ["Поддержка", "/services"],
    ],
  },
  {
    title: "Контакты",
    links: [
      ["Форма обращения", "/contact"],
      ["Почта — заглушка", "/contact"],
      ["Телефон — заглушка", "/contact"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-[#252525] text-white">
      <div className="site-container grid gap-12 py-16 md:grid-cols-[1.2fr_2fr] md:py-20">
        <div>
          <div className="relative inline-block text-2xl font-black tracking-[-0.06em]">
            <span className="absolute -left-2 top-0 h-full w-1 bg-primary" />
            KLIKO
          </div>
          <p className="body-copy mt-6 max-w-lg text-white/55">
            Каркас описания компании. Финальный текст будет добавлен на этапе наполнения.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="top-nav-type font-semibold uppercase tracking-[0.13em] text-white/45">
                {group.title}
              </h2>
              <ul className="nav-type mt-6 space-y-3">
                {group.links.map(([label, href]) => (
                  <li key={label}>
                    <Link className="focus-ring text-white/75 transition-colors hover:text-white" href={href}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="site-container flex flex-col gap-3 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 KLIKO. Демонстрационный каркас.</p>
          <div className="flex gap-5">
            <Link className="hover:text-white" href="/">Конфиденциальность</Link>
            <Link className="hover:text-white" href="/">Правовая информация</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

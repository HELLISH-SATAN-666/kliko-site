import { Github, Instagram, Linkedin, Send, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const footerGroups = [
  {
    title: "Услуги",
    links: [
      ["Разработка ПО", "/services"],
      ["ИТ-консалтинг", "/services"],
      ["Цифровые продукты", "/services"],
    ],
  },
  {
    title: "Технологии",
    links: [
      ["ИИ и данные", "/#technologies"],
      ["Большие данные", "/#technologies"],
      ["Аналитика данных", "/#technologies"],
    ],
  },
  {
    title: "Отрасли",
    links: [
      ["Финтех", "/projects"],
      ["Ритейл", "/projects"],
      ["Здравоохранение", "/projects"],
    ],
  },
  {
    title: "О компании",
    links: [
      ["О нас", "/about"],
      ["Проекты", "/projects"],
      ["Статьи", "/articles"],
    ],
  },
] as const;

const socialItems = [
  { label: "LinkedIn — заглушка", Icon: Linkedin },
  { label: "YouTube — заглушка", Icon: Youtube },
  { label: "Telegram — заглушка", Icon: Send },
  { label: "GitHub — заглушка", Icon: Github },
  { label: "Instagram — заглушка", Icon: Instagram },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-container site-footer-container">
        <h2 className="site-footer-title">
          Создаём программные продукты вместе<span aria-hidden="true">!</span>
        </h2>

        <div className="site-footer-main">
          <div className="site-footer-contact">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span>Регион — заглушка</span>
              <span className="site-footer-contact-value">Телефон — заглушка</span>
            </div>
            <span className="site-footer-contact-value">Почта для проектов — заглушка</span>
            <span className="site-footer-contact-value">Общие вопросы — заглушка</span>
            <span className="site-footer-contact-value">Карьера — заглушка</span>
          </div>

          {footerGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="site-footer-group-title">{group.title}</h3>
              <ul className="site-footer-links">
                {group.links.map(([label, href]) => (
                  <li key={label}>
                    <Link className="focus-ring" href={href}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="site-footer-divider" />

        <div className="site-footer-bottom">
          <Link className="focus-ring inline-flex w-fit" href="/" aria-label="KLIKO — главная">
            <Image
              src="/kliko-logo-white.svg"
              alt="KLIKO"
              width={525}
              height={135}
              className="site-footer-logo"
              unoptimized
            />
          </Link>

          <div className="site-footer-legal">
            <p>
              © 2026 KLIKO. Все права защищены. {" "}
              <span className="site-footer-legal-placeholder">Политика конфиденциальности</span>{" "}
              <span className="site-footer-legal-placeholder">Файлы cookie</span>
            </p>
            <p>Юридический адрес — заглушка</p>
          </div>

          <ul className="site-footer-socials" aria-label="Социальные сети">
            {socialItems.map(({ label, Icon }) => (
              <li key={label}>
                <span role="img" aria-label={label} title={label}>
                  <Icon aria-hidden="true" />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

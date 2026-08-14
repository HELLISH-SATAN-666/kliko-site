import Link from "next/link";

export default function AdminWelcome() {
  return (
    <section className="kliko-admin-welcome" aria-labelledby="kliko-admin-title">
      <div className="kliko-admin-welcome__copy">
        <p className="kliko-admin-welcome__eyebrow">KLIKO Content</p>
        <h1 id="kliko-admin-title">Управление материалами</h1>
        <p>
          Создавайте публикации, меняйте даты и обложки, добавляйте изображения,
          таблицы и ссылки — всё содержимое статьи собрано в одном редакторе.
        </p>

        <div className="kliko-admin-welcome__actions">
          <Link className="kliko-admin-welcome__primary" href="/admin/collections/articles">
            Открыть статьи
          </Link>
          <Link className="kliko-admin-welcome__secondary" href="/admin/collections/media">
            Медиатека
          </Link>
        </div>
      </div>

      <div className="kliko-admin-welcome__guide" aria-label="Возможности редактора">
        <p>Редактор без перегруза</p>
        <ul>
          <li>Заголовки, списки и ссылки</li>
          <li>Таблицы и изображения</li>
          <li>Черновики и дата публикации</li>
        </ul>
      </div>
    </section>
  );
}

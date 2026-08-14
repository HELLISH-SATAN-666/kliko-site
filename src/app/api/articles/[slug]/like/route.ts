import config from "@payload-config";
import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getPayload } from "payload";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const origin = request.headers.get("origin");
  const requestHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  if (origin && requestHost) {
    try {
      if (new URL(origin).host !== requestHost) {
        return NextResponse.json(
          { message: "Недопустимый источник запроса." },
          { status: 403 },
        );
      }
    } catch {
      return NextResponse.json({ message: "Некорректный источник запроса." }, { status: 400 });
    }
  }

  const { slug } = await context.params;
  if (!slugPattern.test(slug) || slug.length > 96) {
    return NextResponse.json({ message: "Некорректный адрес статьи." }, { status: 400 });
  }

  if (!process.env.DATABASE_URL || !process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ message: "CMS пока не настроена." }, { status: 503 });
  }

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "articles",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: "published" } },
      ],
    },
  });

  const article = result.docs[0];
  if (!article) {
    return NextResponse.json({ message: "Статья не найдена." }, { status: 404 });
  }

  const cookieName = `kliko-liked-${article.id}`;
  if (request.cookies.has(cookieName)) {
    return NextResponse.json({ likes: article.likes, liked: true });
  }

  // Счётчик обновляется одной SQL-операцией: параллельные клики не теряются,
  // а публичный лайк не создаёт редакционную версию статьи в Payload.
  const updated = await payload.db.pool.query<{ likes: string | number }>(
    `UPDATE "articles"
     SET "likes" = COALESCE("likes", 0) + 1
     WHERE "id" = $1
     RETURNING "likes"`,
    [article.id],
  );
  const likes = Number(updated.rows[0]?.likes);

  if (!Number.isFinite(likes)) {
    return NextResponse.json({ message: "Не удалось сохранить лайк." }, { status: 500 });
  }

  revalidatePath("/articles");
  revalidatePath(`/articles/${slug}`);

  const response = NextResponse.json({ likes, liked: true });
  response.cookies.set(cookieName, "1", {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

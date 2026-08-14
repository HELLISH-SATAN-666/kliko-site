import Image from "next/image";

export default function AdminIcon() {
  return (
    <span className="kliko-admin-mark" aria-label="KLIKO">
      <Image
        src="/kliko-logo-white.svg"
        alt=""
        width={525}
        height={135}
      />
    </span>
  );
}

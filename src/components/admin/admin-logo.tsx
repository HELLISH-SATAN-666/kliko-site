import Image from "next/image";

export default function AdminLogo() {
  return (
    <span className="kliko-admin-logo" aria-label="KLIKO">
      <Image
        src="/kliko-logo.svg"
        alt=""
        width={525}
        height={135}
        priority
      />
    </span>
  );
}

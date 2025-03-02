// NextJS
import Link from "next/link";

// Icons
import { SiGithub, SiLichess } from "react-icons/si";

export function Footer() {
  return (
    <footer className="bg-gray-900/75 shadow-sm">
      <div className="flex w-full flex-wrap items-center justify-between p-2">
        <ul className="mr-8 flex flex-wrap items-center gap-4 text-gray-300">
          <li>
            <Link
              href="https://github.com/chao-mu/chess-coven"
              className="flex items-center gap-2 hover:text-amber-500 hover:underline"
            >
              <SiGithub />
              <span>Source Code</span>
            </Link>
          </li>
          <li>|</li>
          <li>
            <Link
              href="https://lichess.org/@/bestieboots"
              className="flex items-center gap-2 hover:text-amber-500 hover:underline"
            >
              <SiLichess />
              Say hi!
            </Link>
          </li>
        </ul>
        <span className="text-gray-400">
          © 2025{" "}
          <Link
            href="https://modestprogress.com/"
            className="hover:text-amber-500 hover:underline"
          >
            Modest Progress LLC
          </Link>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}

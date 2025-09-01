import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#393E46] text-[#DFD0B8] mt-20 py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h3 className="font-bold text-lg text-white">GameHub</h3>
          <p className="text-sm mt-2">
            &copy; 2025 GameHub. All Rights Reserved.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-lg text-white">Navigate</h3>
          <ul className="mt-2 space-y-2">
            <li>
              <Link href="#" className="hover:text-sky-500 transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-sky-500 transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-sky-500 transition-colors">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-lg text-white">Follow Us</h3>
          <div className="flex justify-center md:justify-start gap-4 mt-2">
            {/* Replace with social media icons */}
            <a href="#" className="hover:text-sky-500 transition-colors">
              Twitch
            </a>
            <a href="#" className="hover:text-sky-500 transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-sky-500 transition-colors">
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

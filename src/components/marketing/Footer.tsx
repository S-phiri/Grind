import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Twitter, Youtube, Linkedin } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Programmes", href: "#programmes" },
    { label: "Pricing", href: "#pricing" },
    { label: "Features", href: "#features" },
    { label: "App Download", href: "#download" },
  ],
  Company: [
    { label: "About", href: "#about" },
    { label: "Blog", href: "#blog" },
    { label: "Careers", href: "#careers" },
    { label: "Press Kit", href: "#press" },
  ],
  Resources: [
    { label: "Help Center", href: "#help" },
    { label: "Terms of Service", href: "#terms" },
    { label: "Privacy Policy", href: "#privacy" },
    { label: "Cookie Policy", href: "#cookies" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 noise-texture">
      {/* Newsletter Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="glassy-panel rounded-2xl p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-display text-3xl text-white mb-2">
                  Stay Updated
                </h3>
                <p className="text-gray-400">
                  Get training tips, programme updates, and performance insights delivered weekly.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#00FF88] flex-1"
                />
                <Button className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] font-semibold whitespace-nowrap">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="font-display text-3xl text-white mb-4">
                GRIND
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Elite performance training for serious footballers.
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-[#00FF88]/20 border border-white/10 hover:border-[#00FF88]/50 flex items-center justify-center text-gray-400 hover:text-[#00FF88] transition-all"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-semibold text-white mb-4">{category}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-[#00FF88] transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Grind Performance. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-xs text-gray-500">
                <span>Built for athletes</span>
                <span>•</span>
                <span>Designed for results</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

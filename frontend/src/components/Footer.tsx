import React from "react";
import { Facebook, Instagram, Twitter, Mail, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-forge-dark text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-bold mb-6">
              <span className="text-teal-400">FORGE</span> PHILIPPINES
            </h3>
            <p className="text-white/70 mb-6">
              Crafting premium vaping experiences with modern design and
              versatile performance.
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              <a
                href="#"
                className="group text-white/70 hover:text-[#02ECCF] transition-all duration-300"
              >
                <Facebook
                  size={20}
                  className="group-hover:scale-110 group-hover:text-[#02ECCF] transition-transform duration-300"
                />
              </a>
              <a
                href="#"
                className="group text-white/70 hover:text-[#02ECCF] transition-all duration-300"
              >
                <Instagram
                  size={20}
                  className="group-hover:scale-110 group-hover:text-[#02ECCF] transition-transform duration-300"
                />
              </a>
              <a
                href="#"
                className="group text-white/70 hover:text-[#02ECCF] transition-all duration-300"
              >
                <Twitter
                  size={20}
                  className="group-hover:scale-110 group-hover:text-[#02ECCF] transition-transform duration-300"
                />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Products</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#products"
                  className="group text-white/70 hover:text-[#02ECCF] transition-all duration-300"
                >
                  <span className="group-hover:scale-105 transition-transform duration-300">
                    Batteries
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#flavors"
                  className="group text-white/70 hover:text-[#02ECCF] transition-all duration-300"
                >
                  <span className="group-hover:scale-105 transition-transform duration-300">
                    Flavor Pods
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="group text-white/70 hover:text-[#02ECCF] transition-all duration-300"
                >
                  <span className="group-hover:scale-105 transition-transform duration-300">
                    Accessories
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="group text-white/70 hover:text-[#02ECCF] transition-all duration-300"
                >
                  <span className="group-hover:scale-105 transition-transform duration-300">
                    Limited Editions
                  </span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Help</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="group text-white/70 hover:text-[#02ECCF] transition-all duration-300"
                >
                  <span className="group-hover:scale-105 transition-transform duration-300">
                    FAQ
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="group text-white/70 hover:text-[#02ECCF] transition-all duration-300"
                >
                  <span className="group-hover:scale-105 transition-transform duration-300">
                    Shipping
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="group text-white/70 hover:text-[#02ECCF] transition-all duration-300"
                >
                  <span className="group-hover:scale-105 transition-transform duration-300">
                    Returns
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="group text-white/70 hover:text-[#02ECCF] transition-all duration-300"
                >
                  <span className="group-hover:scale-105 transition-transform duration-300">
                    Warranty
                  </span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center justify-center md:justify-start">
                <Mail size={18} className="text-forge-teal mr-3" />
                <a
                  href="mailto:info@forgeph.com"
                  className="text-white/70 hover:text-forge-teal transition-colors"
                >
                  info@forgeph.com
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <Phone size={18} className="text-forge-teal mr-3" />
                <a
                  href="tel:+639123456789"
                  className="text-white/70 hover:text-forge-teal transition-colors"
                >
                  +63 912 345 6789
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 text-center border-t border-xforge-teal border-opacity-20">
          <p className="text-sm text-xforge-lightgray">
            &copy; {currentYear} Forge Philippines. All rights reserved. For
            adults 18+ only.
          </p>
          <p className="mt-2 text-xs text-xforge-gray">
            WARNING: This product contains nicotine. Nicotine is an addictive
            chemical.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

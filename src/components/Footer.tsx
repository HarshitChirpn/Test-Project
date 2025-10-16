import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <img
              src="https://idea2mvp.net/getmvp/wp-content/uploads/2024/07/Idea-2-MVP-final-logo-white-bg-04-2048x907.png"
              alt="idea2mvp Logo"
              className="h-16 w-auto bg-white p-2 rounded"
            />
            <p className="text-gray-300 text-sm leading-relaxed">
              Turning ideas into successful products. From concept to launch, we
              help entrepreneurs and businesses build their MVP in record time.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">Company</h3>
            <div className="space-y-2">
              <Link
                to="/getmvp/about"
                className="block text-gray-300 hover:text-brand-yellow transition-colors duration-200"
              >
                About Us
              </Link>
              <Link
                to="/getmvp/services"
                className="block text-gray-300 hover:text-brand-yellow transition-colors duration-200"
              >
                Services
              </Link>
              <Link
                to="/getmvp/contact"
                className="block text-gray-300 hover:text-brand-yellow transition-colors duration-200"
              >
                Contact
              </Link>
              <Link
                to="/getmvp/perks"
                className="block text-gray-300 hover:text-brand-yellow transition-colors duration-200"
              >
                Perks
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">Resources</h3>
            <div className="space-y-2">
              <Link
                to="/getmvp/blog"
                className="block text-gray-300 hover:text-brand-yellow transition-colors duration-200"
              >
                Blog
              </Link>
              <Link
                to="/getmvp/services"
                className="block text-gray-300 hover:text-brand-yellow transition-colors duration-200"
              >
                Portfolio
              </Link>
              <Link
                to="/getmvp/contact"
                className="block text-gray-300 hover:text-brand-yellow transition-colors duration-200"
              >
                Support
              </Link>
              <Link
                to="/getmvp/about"
                className="block text-gray-300 hover:text-brand-yellow transition-colors duration-200"
              >
                FAQ
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">Legal</h3>
            <div className="space-y-2">
              <Link
                to="/getmvp/privacy-policy"
                className="block text-gray-300 hover:text-brand-yellow transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                to="/getmvp/terms-condition"
                className="block text-gray-300 hover:text-brand-yellow transition-colors duration-200"
              >
                Terms of Use
              </Link>
              <Link
                to="/getmvp/contact"
                className="block text-gray-300 hover:text-brand-yellow transition-colors duration-200"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              &copy; 2025 Idea2MVP. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/idea2mvp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-yellow transition-colors duration-200 p-2"
              >
                <Facebook className="w-5 h-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://twitter.com/idea2mvp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-yellow transition-colors duration-200 p-2"
              >
                <Twitter className="w-5 h-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://www.linkedin.com/company/idea2mvp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-yellow transition-colors duration-200 p-2"
              >
                <Linkedin className="w-5 h-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="https://www.instagram.com/idea2mvp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-yellow transition-colors duration-200 p-2"
              >
                <Instagram className="w-5 h-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://www.youtube.com/channel/idea2mvp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-yellow transition-colors duration-200 p-2"
              >
                <Youtube className="w-5 h-5" />
                <span className="sr-only">YouTube</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

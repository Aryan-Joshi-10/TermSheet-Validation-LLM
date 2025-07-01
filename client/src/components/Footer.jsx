const Footer = () => {
  return (
    <footer className="bg-gray-800 text-black py-10">
      <div className="container  mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        {/* Footer Navigation */}
        <div className="mb-6 md:mb-0 ">
          <h3 className="text-lg font-semibold text-black mb-4">Quick Links</h3>
          <ul>
            <li>
              <a href="/home" className="hover:underline">
                Home
              </a>
            </li>
            <li>
              <a href="/about" className="hover:underline">
                About Us
              </a>
            </li>
            <li>
              <a href="/safety" className="hover:underline">
                Safety
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:underline">
                Contact
              </a>
            </li>
            <li>
              <a href="/worker-of-the-month" className="hover:underline">
                Worker of the Month
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="mb-6 md:mb-0">
          <h3 className="text-lg font-semibold text-black mb-4">Contact Us</h3>
          <p>
            Email:{" "}
            <a href="mailto:info@coalmines.com" className="hover:underline">
              info@coalmines.com
            </a>
          </p>
          <p>Phone: +123-456-7890</p>
          <p>Address: 123 Coal Mines Road, Mining City</p>
        </div>

        {/* Social Media Links */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="https://facebook.com" className="hover:text-blue-500">
              <i className="fab fa-facebook-f"></i> {/* FontAwesome Icon */}
            </a>
            <a href="https://twitter.com" className="hover:text-blue-400">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://linkedin.com" className="hover:text-blue-600">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="https://instagram.com" className="hover:text-pink-500">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-10 text-center border-t border-gray-700 text-white pt-4">
        <p>&copy; 2024 Coal Mines. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

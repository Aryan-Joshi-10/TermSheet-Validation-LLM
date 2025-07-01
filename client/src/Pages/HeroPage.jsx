function HeroPage() {
  return (
    <div className="flex flex-col justify-center items-center h-screen text-center p-12">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to TermSheet Validator
      </h1>
      <p className="text-lg mb-6">
        Simplify your term sheet validation process with our easy-to-use tool.
      </p>
      <button
        className="px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none"
        onClick={() => (window.location.href = "/upload")}
      >
        Get Started
      </button>
    </div>
  );
}

export default HeroPage;

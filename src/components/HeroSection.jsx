import { Link } from "react-router-dom";

const HeroSection = () => {
  //Page de inicio
  return (
    <div className="flex flex-col items-center mt-6 lg:mt-40" id="inicio">
      <h1 className="text-4xl sm:text-6xl lg:text-7xl text-center tracking-wide">
        Perfomance, 
        <span className="relative">
          <span className="absolute inset-0 bg-gradient-to-r from-pink-200 to-pink-300 blur-[90px] opacity-30"></span>
          <span className="relative text-gradient"> Analiza la velocidad de tus páginas</span>
        </span>
      </h1>
      <p className="mt-20 text-lg text-center text-neutral-300 max-w-4xl pink__gradient">
        Analiza el rendimiento de las páginas web en dispositivos mobiles & desktop!
      </p>
      <div className="flex justify-center my-10 mb-20">
        <Link to={"#nosotros"} className="bg-gradient-to-r from-orange-500 to-orange-800 py-3 px-4 mx-3 rounded-md">
          Explorar ahora!
        </Link>
      </div>
    </div>
  );
};

export default HeroSection;

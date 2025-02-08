import { CheckCircle2 } from "lucide-react";
import codeImg from "../assets/code.jpg";
import { checklistItems } from "../constants";

const Workflow = () => {
  //Acerca de nosotros
  return (
    <div className="mt-36" id="nosotros">
      <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center mt-6 tracking-wide">
      Acerca de{" "}
        <span className="text-gradient">
          nosotros.
        </span>
      </h2>
      <div className="flex flex-wrap justify-center">
        <div className="p-2 w-full lg:w-1/2 mt-20">
          <img src={codeImg} alt="Coding" />
        </div>
        <div className="pt-12 w-full lg:w-1/2">
          {checklistItems.map((item, index) => (
           <div key={index} 
           className="flex mb-10 p-4 rounded-lg transition-all duration-300 border border-transparent bg-transparent hover:bg-gradient-to-r hover:from-neutral-800 hover:to-neutral-900 group">
              <div className="text-[#33bbcf] mx-6 h-10 w-10 p-2 justify-center items-center rounded-full">
                <CheckCircle2 />
              </div>
              <div>
                <h5 className="mt-1 mb-2 text-xl text-white-800">{item.title}</h5>
                <p className="text-md text-neutral-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Workflow;

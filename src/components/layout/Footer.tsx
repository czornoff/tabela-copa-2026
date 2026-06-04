import { Mail, MessageCircle, Globe } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full max-w-8xl mx-auto px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center md:text-left">
        {/* Coluna 1: Contato (Esquerda) */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold tracking-widest uppercase text-orange-600">
            Contato
          </h3>
          <div className="flex flex-col gap-3 text-sm font-semibold tracking-wide text-zinc-500">
            <a
              href="https://www.mandebem.com" target="_blank" rel="noopener noreferrer"
              className="hover:text-orange-600 transition-colors flex items-center justify-center md:justify-start gap-2"
            >
              <Globe className="w-4 h-4" /> www.mandebem.com
            </a>
            <a
              href="mailto:contato@mandebem.com"
              className="hover:text-orange-600 transition-colors flex items-center justify-center md:justify-start gap-2"
            >
              <Mail className="w-4 h-4" /> contato@mandebem.com
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=5511993788486"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-600 transition-colors flex items-center justify-center md:justify-start gap-2"
            >
              <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp: (11) 99378-8486
            </a>
          </div>
        </div>

        {/* Coluna 3: Logo/Sobre (Direita) */}
        <div className="space-y-3 md:text-right flex flex-col items-center md:items-end">
          <a href="https://mandebem.com" className="hover:text-orange-600 transition-colors text-orange-600">
            <img
                src="https://mandebem.com/img/mandebem.com.png"
                alt="Logo Mande Bem"
                className="h-16 w-auto mb-4 rounded-full"
            />
          </a>    
          <h3 className="text-lg font-black tracking-tight text-orange-600 uppercase">
            <a href="https://mandebem.com" className="hover:text-orange-600 transition-colors text-orange-600">Mande Bem</a> em qualquer ocasião.
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
            Sua central de ferramentas inteligentes para economizar tempo, dinheiro e recursos. Transforme seu
            planejamento em consumo consciente hoje mesmo.
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-zinc-200 dark:border-zinc-900 text-center mt-2 pt-8">
        <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium tracking-wide">
          Seus dados estão seguros conosco. Para saber como tratamos suas informações e o uso de cookies, acesse nossa{" "}
          <a href="https://mandebem.com/politicadeprivacidade.html" 
          target="_blank" rel="noopener noreferrer"
          className="hover:text-orange-600 transition-colors">
            Política de Privacidade
          </a>{" "}
          e nossos{" "}
          <a href="https://mandebem.com/termosdeuso.html" 
          target="_blank" rel="noopener noreferrer"
          className="hover:text-orange-600 transition-colors">
            Termos de Uso
          </a>
          .<br />
          <span className="block mt-1 sm:inline sm:mt-0">Desenvolvido para facilitar o seu cotidiano.</span>
        </div>
      </div>
    </footer>
  );
}

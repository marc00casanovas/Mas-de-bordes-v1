
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';

const PWAInstallPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Comprovem si l'app ja s'està executant en mode "standalone" (instal·lada)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // També comprovem si és un iPad, per mostrar les instruccions correctes
    const isIpad = /iPad/i.test(navigator.userAgent);

    if (!isStandalone && isIpad) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Instal·la l'App a l'iPad</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Per a una millor experiència i per funcionar sense internet, afegeix aquesta app a la teva pantalla d'inici.
        </p>
        
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg inline-block mb-6">
          <QRCode
            value={window.location.href}
            size={180}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"H"}
            includeMargin={false}
            renderAs={"svg"}
          />
        </div>

        <div className="text-left space-y-3">
            <p className="flex items-center"><span className="text-2xl mr-4">1.</span> Obre aquesta pàgina amb <strong>Safari</strong>.</p>
            <p className="flex items-center"><span className="text-2xl mr-4">2.</span> Toca la icona de <strong>Compartir</strong> (un quadrat amb una fletxa amunt <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mx-1"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>). </p>
            <p className="flex items-center"><span className="text-2xl mr-4">3.</span> Busca i selecciona <strong>"Afegir a la pantalla d'inici"</strong>.</p>
        </div>
        
        <button
          onClick={() => setIsVisible(false)}
          className="mt-8 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          Entesos
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;

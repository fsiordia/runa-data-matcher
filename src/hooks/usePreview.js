import { useState } from 'react';
import { generatePreviewHTML } from '../utils/previewHTML.js';

export const usePreview = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [independentPreviews, setIndependentPreviews] = useState([]);

  const showDataPreview = (data, title) => {
    setPreviewData({ data: data.slice(0, 21), title }); // Mostrar 20 filas + header
    setShowPreview(true);
  };

  const openIndependentPreview = (data, title) => {
    console.log('Abriendo preview independiente:', title, 'Data length:', data?.length);
    if (!data || data.length === 0) {
      console.error('No hay datos para mostrar');
      return;
    }

    // Crear HTML completo para la nueva ventana
    const htmlContent = generatePreviewHTML(data, title);
    
    // Abrir nueva ventana del navegador
    const newWindow = window.open('', '_blank', 
      'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no'
    );
    
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.focus();
      
      // Actualizar contador para UI
      const newPreview = {
        id: Date.now(),
        title: title,
        timestamp: new Date().toLocaleTimeString(),
        window: newWindow
      };
      
      setIndependentPreviews(prev => {
        const updated = [...prev, newPreview];
        console.log('Ventana abierta, total:', updated.length);
        return updated;
      });
      
      // Detectar cuando se cierra la ventana
      const checkClosed = setInterval(() => {
        if (newWindow.closed) {
          setIndependentPreviews(prev => prev.filter(p => p.id !== newPreview.id));
          clearInterval(checkClosed);
          console.log('Ventana cerrada');
        }
      }, 1000);
    } else {
      alert('No se pudo abrir la ventana. Verifica que no esté bloqueado por el navegador.');
    }
  };

  const closeIndependentPreview = (id) => {
    // Buscar y cerrar la ventana específica
    const preview = independentPreviews.find(p => p.id === id);
    if (preview && preview.window) {
      preview.window.close();
    }
    setIndependentPreviews(prev => prev.filter(preview => preview.id !== id));
  };

  const closeAllPreviews = () => {
    independentPreviews.forEach(preview => {
      if (preview.window) {
        preview.window.close();
      }
    });
    setIndependentPreviews([]);
  };

  const resetPreview = () => {
    setShowPreview(false);
    setPreviewData(null);
    closeAllPreviews();
  };

  return {
    showPreview,
    previewData,
    independentPreviews,
    showDataPreview,
    openIndependentPreview,
    closeIndependentPreview,
    closeAllPreviews,
    setShowPreview,
    resetPreview
  };
};
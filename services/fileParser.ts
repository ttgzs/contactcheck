
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs`;

export const extractTextFromFile = async (file: File): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') {
    return extractTextFromPDF(file);
  } else if (extension === 'docx' || extension === 'doc') {
    return extractTextFromDocx(file);
  } else if (extension === 'txt' || extension === 'md') {
    return extractTextFromPlainText(file);
  } else {
    throw new Error('不支持的文件格式。请上传 PDF, DOC, DOCX, TXT 或 MD 文件。');
  }
};

const extractTextFromPlainText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(new Error('读取文本文件失败'));
    reader.readAsText(file);
  });
};

const extractTextFromDocx = async (file: File): Promise<string> => {
  // 使用FileReader读取文件内容
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        console.log('开始解析Word文件，大小:', arrayBuffer.byteLength, '字节');
        
        const result = await mammoth.extractRawText({ arrayBuffer });
        console.log('Word文件解析结果:', result.value.length, '字符');
        console.log('解析过程中的警告:', result.messages);
        
        resolve(result.value);
      } catch (error) {
        console.error('Word文件解析错误:', error);
        reject(new Error('解析Word文件失败'));
      }
    };
    
    reader.onerror = (e) => {
      console.error('文件读取错误:', e);
      reject(new Error('读取Word文件失败'));
    };
    
    // 以ArrayBuffer形式读取文件
    reader.readAsArrayBuffer(file);
  });
};

const extractTextFromPDF = async (file: File): Promise<string> => {
  // 使用FileReader读取文件内容，与Word文件解析保持一致
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        console.log('开始解析PDF文件，大小:', arrayBuffer.byteLength, '字节');
        
        // 添加更多PDF.js配置，以支持中文文本
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/standard_fonts/'
        });
        
        const pdf = await loadingTask.promise;
        console.log('PDF文件页数:', pdf.numPages);
        
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // 检查textContent.items的结构和内容
          console.log(`第${i}页文本项数量:`, textContent.items.length);
          if (textContent.items.length > 0) {
            console.log(`第${i}页前几个文本项:`, textContent.items.slice(0, 5).map((item: any) => item.str));
          }
          
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          fullText += pageText + '\n';
        }
        
        console.log('PDF文件解析结果:', fullText.length, '字符');
        resolve(fullText);
      } catch (error) {
        console.error('PDF文件解析错误:', error);
        reject(new Error('解析PDF文件失败'));
      }
    };
    
    reader.onerror = (e) => {
      console.error('文件读取错误:', e);
      reject(new Error('读取PDF文件失败'));
    };
    
    // 以ArrayBuffer形式读取文件
    reader.readAsArrayBuffer(file);
  });
};

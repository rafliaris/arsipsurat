"""
OCR Service
Handles OCR text extraction from documents using Tesseract
"""
import re
from pathlib import Path
from typing import Tuple, List, Dict, Optional
from PIL import Image
import pytesseract
import PyPDF2
from fastapi import HTTPException, status
from app.core.config import settings


class OCRService:
    """Service for OCR operations"""
    
    def __init__(self):
        """Initialize OCR service with Tesseract configuration"""
        # Set Tesseract command path from settings
        if settings.TESSERACT_CMD != "tesseract":
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
    
    def extract_text_from_image(self, image_path: str) -> Tuple[str, float]:
        """
        Extract text from image using Tesseract OCR
        
        Args:
            image_path: Path to image file
        
        Returns:
            Tuple of (extracted_text, confidence_score)
        """
        try:
            # Open image
            image = Image.open(image_path)
            
            # Perform OCR with confidence data
            ocr_data = pytesseract.image_to_data(
                image,
                lang=settings.OCR_LANGUAGE,
                output_type=pytesseract.Output.DICT
            )
            
            # Extract text
            text = pytesseract.image_to_string(image, lang=settings.OCR_LANGUAGE)
            
            # Calculate average confidence
            confidences = [
                int(conf) for conf in ocr_data['conf'] 
                if conf != '-1'  # Filter out invalid confidence scores
            ]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            
            return (text.strip(), round(avg_confidence, 2))
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"OCR failed for image: {str(e)}"
            )
    
    def extract_text_from_pdf(self, pdf_path: str) -> Tuple[str, float]:
        """
        Extract text from PDF
        For PDFs with text: extract directly
        For scanned PDFs: convert to images and OCR
        
        Args:
            pdf_path: Path to PDF file
        
        Returns:
            Tuple of (extracted_text, confidence_score)
        """
        try:
            text_parts = []
            
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                # Try to extract text directly from PDF
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
                
                # If we got text, return it
                if text_parts:
                    combined_text = '\n'.join(text_parts)
                    # For extracted PDF text, we assume high confidence
                    return (combined_text.strip(), 95.0)
            
            # If no text extracted, it's likely a scanned PDF
            # TODO: Implement PDF to image conversion and OCR
            # For now, return empty with low confidence
            return ("", 0.0)
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"PDF processing failed: {str(e)}"
            )
    
    def extract_keywords(self, text: str) -> List[str]:
        """
        Extract keywords from text
        Simple implementation: find important words (length > 3, alphanumeric)
        
        Args:
            text: Input text
        
        Returns:
            List of extracted keywords (unique, lowercase)
        """
        # Clean text
        text = text.lower()
        
        # Remove special characters except spaces
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
        
        # Split into words
        words = text.split()
        
        # Filter important words (length > 3)
        keywords = [
            word for word in words 
            if len(word) > 3
        ]
        
        # Get unique keywords, sorted by frequency
        keyword_freq = {}
        for kw in keywords:
            keyword_freq[kw] = keyword_freq.get(kw, 0) + 1
        
        # Sort by frequency and take top 20
        sorted_keywords = sorted(
            keyword_freq.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return [kw for kw, freq in sorted_keywords[:20]]
    
    def process_file(self, file_path: str, file_type: str) -> Dict[str, any]:
        """
        Process file and extract text based on file type
        
        Args:
            file_path: Path to file
            file_type: MIME type of file
        
        Returns:
            Dictionary with 'text', 'confidence', and 'keywords'
        """
        try:
            text = ""
            confidence = 0.0
            
            # Determine processing method based on file type
            if 'pdf' in file_type.lower():
                text, confidence = self.extract_text_from_pdf(file_path)
            elif any(img_type in file_type.lower() for img_type in ['image', 'jpeg', 'jpg', 'png']):
                text, confidence = self.extract_text_from_image(file_path)
            else:
                # Unsupported file type
                return {
                    'text': '',
                    'confidence': 0.0,
                    'keywords': []
                }
            
            # Extract keywords
            keywords = self.extract_keywords(text) if text else []
            
            return {
                'text': text,
                'confidence': confidence,
                'keywords': keywords
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"File processing failed: {str(e)}"
            )


# Create singleton instance
ocr_service = OCRService()

"""
Kategori API Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.kategori import Kategori
from app.schemas.kategori import (
    KategoriCreate,
    KategoriUpdate,
    KategoriResponse,
    KategoriList,
)
from app.api.deps import get_current_active_admin, get_current_user

router = APIRouter(prefix="/kategori")


@router.get("", response_model=List[KategoriList])
def list_kategori(
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
):
    """
    Get list of categories
    Anyone can view categories
    """
    query = db.query(Kategori).filter(Kategori.deleted_at == None)
    
    if not include_inactive:
        query = query.filter(Kategori.is_active == True)
    
    categories = query.offset(skip).limit(limit).all()
    return categories


@router.post("", response_model=KategoriResponse, status_code=status.HTTP_201_CREATED)
def create_kategori(
    kategori: KategoriCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin),  # Only admin can create
):
    """
    Create new category
    Admin only
    """
    # Check if kode already exists
    existing = db.query(Kategori).filter(
        Kategori.kode == kategori.kode,
        Kategori.deleted_at == None
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with code '{kategori.kode}' already exists"
        )
    
    # Create new category
    db_kategori = Kategori(**kategori.model_dump())
    db.add(db_kategori)
    db.commit()
    db.refresh(db_kategori)
    
    return db_kategori


@router.get("/{kategori_id}", response_model=KategoriResponse)
def get_kategori(
    kategori_id: int,
    db: Session = Depends(get_db),
):
    """Get category by ID"""
    kategori = db.query(Kategori).filter(
        Kategori.id == kategori_id,
        Kategori.deleted_at == None
    ).first()
    
    if not kategori:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return kategori


@router.put("/{kategori_id}", response_model=KategoriResponse)
def update_kategori(
    kategori_id: int,
    kategori_update: KategoriUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin),  # Only admin
):
    """
    Update category
    Admin only
    """
    # Get existing category
    db_kategori = db.query(Kategori).filter(
        Kategori.id == kategori_id,
        Kategori.deleted_at == None
    ).first()
    
    if not db_kategori:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Update fields
    update_data = kategori_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_kategori, field, value)
    
    db.commit()
    db.refresh(db_kategori)
    
    return db_kategori


@router.delete("/{kategori_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_kategori(
    kategori_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin),  # Only admin
):
    """
    Soft delete category
    Admin only
    """
    db_kategori = db.query(Kategori).filter(
        Kategori.id == kategori_id,
        Kategori.deleted_at == None
    ).first()
    
    if not db_kategori:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Soft delete
    db_kategori.soft_delete()
    db.commit()
    
    return None

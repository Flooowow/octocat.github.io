import React, { useState, useRef, useEffect } from 'react';
import { Plus, Settings, Trash2, Edit2, GripVertical, ZoomIn, ZoomOut } from 'lucide-react';

export default function TimelineApp() {
  const [menuOpen, setMenuOpen] = useState(true);
  const [settings, setSettings] = useState({
    startYear: 1300,
    endYear: 1700,
    scale: 50,
    pagesH: 2,
    pagesV: 1
  });
  const [events, setEvents] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [timelineOffset, setTimelineOffset] = useState(300);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [draggedItem, setDraggedItem] = useState(null);
  const [resizingItem, setResizingItem] = useState(null);
  const canvasRef = useRef(null);

  // Modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form states
  const [eventForm, setEventForm] = useState({ name: '', year: '', image: null, y: 100, height: 120 });
  const [periodForm, setPeriodForm] = useState({ name: '', startYear: '', endYear: '', color: '#4299e1', y: 50, height: 40 });

  const pageWidth = 1400;
  const pageHeight = 800;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEventForm({ ...eventForm, image: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addEvent = () => {
    if (eventForm.name && eventForm.year && eventForm.image) {
      if (editMode && selectedItem) {
        setEvents(events.map(e => e.id === selectedItem.id ? { ...eventForm, id: selectedItem.id } : e));
      } else {
        setEvents([...events, { ...eventForm, id: Date.now() }]);
      }
      setEventForm({ name: '', year: '', image: null, y: 100, height: 120 });
      setShowEventModal(false);
      setEditMode(false);
      setSelectedItem(null);
    }
  };

  const addPeriod = () => {
    if (periodForm.name && periodForm.startYear && periodForm.endYear) {
      if (editMode && selectedItem) {
        setPeriods(periods.map(p => p.id === selectedItem.id ? { ...periodForm, id: selectedItem.id } : p));
      } else {
        setPeriods([...periods, { ...periodForm, id: Date.now() }]);
      }
      setPeriodForm({ name: '', startYear: '', endYear: '', color: '#4299e1', y: 50, height: 40 });
      setShowPeriodModal(false);
      setEditMode(false);
      setSelectedItem(null);
    }
  };

  const deleteItem = (item, type) => {
    if (type === 'event') {
      setEvents(events.filter(e => e.id !== item.id));
    } else {
      setPeriods(periods.filter(p => p.id !== item.id));
    }
    setSelectedItem(null);
  };

  const editItem = (item, type) => {
    setSelectedItem({ ...item, type });
    setEditMode(true);
    if (type === 'event') {
      setEventForm(item);
      setShowEventModal(true);
    } else {
      setPeriodForm(item);
      setShowPeriodModal(true);
    }
  };

  const yearToX = (year) => {
    const totalYears = settings.endYear - settings.startYear;
    const totalWidth = pageWidth * settings.pagesH;
    return ((year - settings.startYear) / totalYears) * totalWidth;
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.closest('svg')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - viewOffset.x, y: e.clientY - viewOffset.y });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isDragging) {
      setViewOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // Handle dragging events vertically
  const handleEventMouseDown = (e, event) => {
    e.stopPropagation();
    if (!e.target.classList.contains('resize-handle')) {
      setDraggedItem({ item: event, type: 'event', startY: e.clientY - event.y });
    }
  };

  const handleEventMouseMove = (e) => {
    if (draggedItem && draggedItem.type === 'event') {
      const newY = e.clientY - draggedItem.startY;
      setEvents(events.map(ev => 
        ev.id === draggedItem.item.id ? { ...ev, y: Math.max(0, newY) } : ev
      ));
    }
  };

  const handleEventMouseUp = () => {
    setDraggedItem(null);
  };

  // Handle resizing events
  const handleResizeStart = (e, event) => {
    e.stopPropagation();
    setResizingItem({ item: event, startY: e.clientY, startHeight: event.height });
  };

  const handleResizeMove = (e) => {
    if (resizingItem) {
      const deltaY = e.clientY - resizingItem.startY;
      const newHeight = Math.max(80, resizingItem.startHeight + deltaY);
      setEvents(events.map(ev => 
        ev.id === resizingItem.item.id ? { ...ev, height: newHeight } : ev
      ));
    }
  };

  const handleResizeEnd = () => {
    setResizingItem(null);
  };

  // Handle dragging periods vertically
  const handlePeriodMouseDown = (e, period) => {
    e.stopPropagation();
    if (!e.target.classList.contains('resize-handle-period')) {
      setDraggedItem({ item: period, type: 'period', startY: e.clientY - period.y });
    }
  };

  const handlePeriodMouseMove = (e) => {
    if (draggedItem && draggedItem.type === 'period') {
      const newY = e.clientY - draggedItem.startY;
      setPeriods(periods.map(p => 
        p.id === draggedItem.item.id ? { ...p, y: Math.max(0, newY) } : p
      ));
    }
  };

  // Handle resizing periods
  const handlePeriodResizeStart = (e, period) => {
    e.stopPropagation();
    setResizingItem({ item: period, type: 'period', startY: e.clientY, startHeight: period.height });
  };

  const handlePeriodResizeMove = (e) => {
    if (resizingItem && resizingItem.type === 'period') {
      const deltaY = e.clientY - resizingItem.startY;
      const newHeight = Math.max(30, resizingItem.startHeight + deltaY);
      setPeriods(periods.map(p => 
        p.id === resizingItem.item.id ? { ...p, height: newHeight } : p
      ));
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleCanvasMouseMove);
      window.addEventListener('mouseup', handleCanvasMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleCanvasMouseMove);
        window.removeEventListener('mouseup', handleCanvasMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  useEffect(() => {
    if (draggedItem) {
      if (draggedItem.type === 'event') {
        window.addEventListener('mousemove', handleEventMouseMove);
        window.addEventListener('mouseup', handleEventMouseUp);
        return () => {
          window.removeEventListener('mousemove', handleEventMouseMove);
          window.removeEventListener('mouseup', handleEventMouseUp);
        };
      } else if (draggedItem.type === 'period') {
        window.addEventListener('mousemove', handlePeriodMouseMove);
        window.addEventListener('mouseup', handleEventMouseUp);
        return () => {
          window.removeEventListener('mousemove', handlePeriodMouseMove);
          window.removeEventListener('mouseup', handleEventMouseUp);
        };
      }
    }
  }, [draggedItem, events, periods]);

  useEffect(() => {
    if (resizingItem) {
      if (resizingItem.type === 'period') {
        window.addEventListener('mousemove', handlePeriodResizeMove);
        window.addEventListener('mouseup', handleResizeEnd);
        return () => {
          window.removeEventListener('mousemove', handlePeriodResizeMove);
          window.removeEventListener('mouseup', handleResizeEnd);
        };
      } else {
        window.addEventListener('mousemove', handleResizeMove);
        window.addEventListener('mouseup', handleResizeEnd);
        return () => {
          window.removeEventListener('mousemove', handleResizeMove);
          window.removeEventListener('mouseup', handleResizeEnd);
        };
      }
    }
  }, [resizingItem, events, periods]);

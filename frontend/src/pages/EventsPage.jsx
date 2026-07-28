import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchEvents, createEvent, updateEvent, fetchEventDetail, deleteEvent } from '../api/events';
import { getRsvpStatus, joinEvent, leaveEvent, getMyEvents } from '../api/rsvp';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

// SVG Icons
const MapPinIcon = () => (
  <svg className="w-4 h-4 text-[var(--color-presence)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-4 h-4 text-[var(--color-presence)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4 text-[var(--color-presence)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4 text-[var(--color-presence)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function EventsPage({ onNavigateAuth }) {
  const { user, accessToken, logout } = useAuth();
  const calendarRef = useRef(null);
  const profileMenuRef = useRef(null);
  
  // Data state
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Single event detail screen state
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // RSVP State
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'mine'
  const [rsvpJoined, setRsvpJoined] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState('');
  const [myEventsList, setMyEventsList] = useState([]);
  const [myEventsLoading, setMyEventsLoading] = useState(false);
  const [myEventsError, setMyEventsError] = useState('');

  // Form toggles
  const [isCreating, setIsCreating] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  // Form fields state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');

  // Custom Date/Time States (using 12-hour format internally)
  const [eventDate, setEventDate] = useState(''); // YYYY-MM-DD
  const [hourVal, setHourVal] = useState(7); // 1-12
  const [minuteVal, setMinuteVal] = useState(0); // 0-55
  const [ampm, setAmpm] = useState('PM'); // 'AM' or 'PM'
  
  // Custom Calendar Popover States
  const [showCalendar, setShowCalendar] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  // Loading/Error for forms
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Promise-based confirmation popup helper
  const triggerConfirm = (options) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        title: options.title || 'Are you sure?',
        message: options.message || '',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        isDanger: options.isDanger || false,
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        }
      });
    });
  };

  // Constants
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Close calendar or profile dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load events list
  const loadEventsList = async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (err) {
      setFetchError('Failed to load upcoming events.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load single event details
  const loadEventDetail = async (eventId) => {
    setIsDetailLoading(true);
    setDetailError('');
    try {
      const data = await fetchEventDetail(eventId);
      setSelectedEvent(data);
    } catch (err) {
      setDetailError('Failed to retrieve event details.');
      console.error(err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Load RSVP status
  const loadRsvpStatus = async (eventId) => {
    if (!user || !accessToken) return;
    setRsvpLoading(true);
    setRsvpError('');
    try {
      const res = await getRsvpStatus(eventId, accessToken);
      setRsvpJoined(res.joined);
    } catch (err) {
      console.error('Failed to load RSVP status:', err);
      setRsvpError('Failed to verify reservation status.');
    } finally {
      setRsvpLoading(false);
    }
  };

  // Join Event action
  const handleJoinEvent = async (eventId) => {
    if (!user || !accessToken) return;
    
    const confirmed = await triggerConfirm({
      title: "Join Event",
      message: `Are you sure you want to RSVP for "${selectedEvent?.title || 'this event'}"?`,
      confirmText: "Join",
      isDanger: false
    });
    if (!confirmed) return;

    setRsvpLoading(true);
    setRsvpError('');
    try {
      await joinEvent(eventId, accessToken);
      setRsvpJoined(true);
      await loadEventsList();
    } catch (err) {
      console.error('Join error:', err);
      if (err && err.non_field_errors) {
        setRsvpError(err.non_field_errors);
      } else {
        setRsvpError('This event is full.');
      }
    } finally {
      setRsvpLoading(false);
    }
  };

  // Leave Event action
  const handleLeaveEvent = async (eventId) => {
    if (!user || !accessToken) return;

    const confirmed = await triggerConfirm({
      title: "Leave Event",
      message: `Are you sure you want to cancel your reservation for "${selectedEvent?.title || 'this event'}"?`,
      confirmText: "Leave",
      isDanger: true
    });
    if (!confirmed) return;

    setRsvpLoading(true);
    setRsvpError('');
    try {
      await leaveEvent(eventId, accessToken);
      setRsvpJoined(false);
      await loadEventsList();
    } catch (err) {
      console.error('Leave error:', err);
      if (err && err.non_field_errors) {
        setRsvpError(err.non_field_errors);
      } else {
        setRsvpError('Failed to leave the event.');
      }
    } finally {
      setRsvpLoading(false);
    }
  };

  // Load My RSVPs list
  const loadMyJoinedEvents = async () => {
    if (!user || !accessToken) return;
    setMyEventsLoading(true);
    setMyEventsError('');
    try {
      const rsvps = await getMyEvents(accessToken);
      const allEvents = await fetchEvents();
      const joined = [];

      for (const rsvp of rsvps) {
        let matched = allEvents.find(e => String(e.id) === String(rsvp.event_id));
        if (!matched) {
          try {
            matched = await fetchEventDetail(rsvp.event_id);
          } catch (e) {
            console.warn(`Could not fetch details for event ${rsvp.event_id}`);
          }
        }
        if (matched) {
          joined.push({ ...matched, rsvpId: rsvp.id, rsvpStatus: rsvp.status });
        }
      }
      setMyEventsList(joined);
    } catch (err) {
      console.error('Failed to load my events:', err);
      setMyEventsError('Failed to retrieve your reservations.');
    } finally {
      setMyEventsLoading(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId) => {
    console.log('[handleDeleteEvent] Delete request triggered. Spawning custom confirmation popup...');
    const confirmed = await triggerConfirm({
      title: "Delete Event",
      message: "Are you sure you want to delete this event? This action cannot be undone.",
      confirmText: "Delete",
      isDanger: true
    });
    console.log('[handleDeleteEvent] Delete confirmation resolved with value:', confirmed);
    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setFormErrors({});
    try {
      console.log('[handleDeleteEvent] Sending DELETE request for eventId:', eventId);
      await deleteEvent(eventId, accessToken);
      console.log('[handleDeleteEvent] Event deleted successfully from backend');
      setShowDeleteConfirm(false);
      setSelectedEventId(null); // Go back to catalog
      await loadEventsList();
    } catch (err) {
      console.error('[handleDeleteEvent] Delete request failed:', err);
      if (typeof err === 'object') {
        setFormErrors(err);
      } else {
        setFormErrors({ non_field_errors: 'Failed to delete the event.' });
      }
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'mine') {
      loadMyJoinedEvents();
    } else {
      loadEventsList();
    }
  }, [viewMode, accessToken]);

  useEffect(() => {
    if (selectedEventId) {
      loadEventDetail(selectedEventId);
      loadRsvpStatus(selectedEventId);
    } else {
      setSelectedEvent(null);
      setRsvpJoined(false);
      setRsvpError('');
    }
  }, [selectedEventId]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setEventDate('');
    setHourVal(7);
    setMinuteVal(0);
    setAmpm('PM');
    setCapacity('');
    setFormErrors({});
  };

  const handleCreateToggle = () => {
    if (!user) {
      onNavigateAuth();
      return;
    }
    setIsCreating(!isCreating);
    setEditingEventId(null);
    resetForm();
  };

  const handleEditInit = (event) => {
    setEditingEventId(event.id);
    setIsCreating(false);
    setTitle(event.title);
    setDescription(event.description || '');
    setLocation(event.location);
    
    try {
      const dateObj = new Date(event.start_time);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');
      setEventDate(`${yyyy}-${mm}-${dd}`);

      const dbHours = dateObj.getHours();
      const dbMinutes = dateObj.getMinutes();
      setMinuteVal(dbMinutes);

      if (dbHours === 0) {
        setHourVal(12);
        setAmpm('AM');
      } else if (dbHours === 12) {
        setHourVal(12);
        setAmpm('PM');
      } else if (dbHours > 12) {
        setHourVal(dbHours - 12);
        setAmpm('PM');
      } else {
        setHourVal(dbHours);
        setAmpm('AM');
      }
      
      setCalMonth(dateObj.getMonth());
      setCalYear(yyyy);
    } catch (e) {
      setEventDate('');
      setHourVal(7);
      setMinuteVal(0);
      setAmpm('PM');
    }

    setCapacity(event.capacity.toString());
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
    resetForm();
  };

  const handleFormInputChange = (field, value) => {
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (field === 'title') setTitle(value);
    if (field === 'description') setDescription(value);
    if (field === 'location') setLocation(value);
    if (field === 'capacity') setCapacity(value);
  };

  // Adjust hour stepper (wrapping 1-12)
  const adjustHour = (amount) => {
    setHourVal((prev) => {
      let next = prev + amount;
      if (next < 1) return 12;
      if (next > 12) return 1;
      return next;
    });
  };

  // Adjust minute stepper (wrapping 0-55, incrementing by 5 mins)
  const adjustMinute = (amount) => {
    setMinuteVal((prev) => {
      let next = prev + amount;
      if (next < 0) return 55;
      if (next > 59) return 0;
      return next;
    });
  };

  // Calendar month navigation (restricted to prevent visiting past months)
  const handleMonthChange = (offset) => {
    setCalMonth((prev) => {
      let nextMonth = prev + offset;
      let nextYear = calYear;
      
      if (nextMonth < 0) {
        nextMonth = 11;
        nextYear = calYear - 1;
      } else if (nextMonth > 11) {
        nextMonth = 0;
        nextYear = calYear + 1;
      }

      // Restrict navigation to past months
      const now = new Date();
      const currentLimit = new Date(now.getFullYear(), now.getMonth(), 1);
      const targetLimit = new Date(nextYear, nextMonth, 1);

      if (targetLimit < currentLimit) {
        return prev;
      }

      setCalYear(nextYear);
      return nextMonth;
    });
  };

  // Build grid of days (flagging previous dates as disabled)
  const getDaysInMonth = (month, year) => {
    const date = new Date(year, month, 1);
    const days = [];
    const startDay = date.getDay();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    // Set current date limit at midnight
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);
    
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, current: false, dateStr: null, isPast: true });
    }
    
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= totalDays; i++) {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(i).padStart(2, '0');
      const dateStr = `${year}-${mm}-${dd}`;
      const dObj = new Date(dateStr + 'T00:00:00');
      const isPast = dObj < todayObj;

      days.push({ 
        day: i, 
        current: true, 
        dateStr, 
        isPast 
      });
    }
    
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, current: false, dateStr: null, isPast: true });
    }
    return days;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('[handleFormSubmit] Form submission started...');
    setActionLoading(true);
    setFormErrors({});

    const errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!location.trim()) errors.location = 'Location is required';
    
    if (!eventDate) {
      errors.eventDate = 'Please select a date';
    }
    if (!capacity || isNaN(capacity) || parseInt(capacity) <= 0) {
      errors.capacity = 'Capacity must be greater than 0';
    }

    if (Object.keys(errors).length > 0) {
      console.warn('[handleFormSubmit] Validation failed:', errors);
      setFormErrors(errors);
      setActionLoading(false);
      return;
    }

    if (editingEventId) {
      console.log('[handleFormSubmit] Editing event. Spawning custom confirmation popup...');
      const confirmed = await triggerConfirm({
        title: "Save changes",
        message: "Are you sure you want to save changes to this event?",
        confirmText: "Save",
        isDanger: false
      });
      console.log('[handleFormSubmit] Confirmation resolved with value:', confirmed);
      if (!confirmed) {
        setActionLoading(false);
        return;
      }
    }

    try {
      let hour24 = hourVal;
      if (ampm === 'PM' && hourVal < 12) {
        hour24 = hourVal + 12;
      } else if (ampm === 'AM' && hourVal === 12) {
        hour24 = 0;
      }

      const timeStr = `${String(hour24).padStart(2, '0')}:${String(minuteVal).padStart(2, '0')}`;
      const localString = `${eventDate}T${timeStr}:00`;
      const utcStartTime = new Date(localString).toISOString();
      
      const eventData = {
        title,
        description,
        location,
        start_time: utcStartTime,
        capacity: parseInt(capacity),
      };

      console.log('[handleFormSubmit] Sending request to event-service with payload:', eventData);

      if (editingEventId) {
        await updateEvent(editingEventId, eventData, accessToken);
        console.log('[handleFormSubmit] Event updated successfully in backend');
        if (selectedEventId === editingEventId) {
          loadEventDetail(editingEventId);
        }
        setEditingEventId(null);
      } else {
        await createEvent(eventData, accessToken);
        console.log('[handleFormSubmit] Event created successfully in backend');
        setIsCreating(false);
      }
      resetForm();
      await loadEventsList();
    } catch (err) {
      console.error('[handleFormSubmit] Save request failed:', err);
      if (typeof err === 'object') {
        setFormErrors(err);
      } else {
        setFormErrors({ non_field_errors: 'Failed to process event details.' });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const parseEventDate = (isoString) => {
    try {
      const d = new Date(isoString);
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const month = months[d.getMonth()];
      
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const currentAmpm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const time = `${hours}:${minutes} ${currentAmpm}`;
      
      const fullDate = d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      return { day, month, time, fullDate };
    } catch (e) {
      return { day: '??', month: '???', time: '12:00 AM', fullDate: 'Unknown date' };
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Select Date';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const isFormOpen = isCreating || editingEventId;
  const days = getDaysInMonth(calMonth, calYear);

  return (
    <div className="w-full min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col font-sans">
      
      {/* Header */}
      <header className="sticky top-0 w-full border-b border-[var(--color-hairline)] py-4 px-6 md:px-12 flex justify-between items-center select-none bg-[var(--color-paper)]/95 backdrop-blur-[4px] z-40 transition-colors duration-200">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setSelectedEventId(null); handleCancelEdit(); setIsCreating(false); setViewMode('all'); }}
            className="font-display text-2xl m-0 tracking-tight font-semibold bg-transparent border-none cursor-pointer text-[var(--color-ink)]"
          >
            MetUps
          </button>
          <span className="h-4 w-[1px] bg-[var(--color-hairline)] hidden md:inline"></span>
          <button
            onClick={() => { setSelectedEventId(null); handleCancelEdit(); setIsCreating(false); setViewMode('all'); }}
            className={`font-mono text-[9px] tracking-widest uppercase cursor-pointer border-none bg-transparent ${
              viewMode === 'all' ? 'text-[var(--color-ink)] font-bold' : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            Directory
          </button>
          {user && (
            <>
              <span className="h-4 w-[1px] bg-[var(--color-hairline)] hidden md:inline"></span>
              <button
                onClick={() => { setSelectedEventId(null); handleCancelEdit(); setIsCreating(false); setViewMode('mine'); }}
                className={`font-mono text-[9px] tracking-widest uppercase cursor-pointer border-none bg-transparent ${
                  viewMode === 'mine' ? 'text-[var(--color-ink)] font-bold' : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                My Schedule
              </button>
              <span className="h-4 w-[1px] bg-[var(--color-hairline)] hidden md:inline"></span>
              <button
                onClick={() => { setSelectedEventId(null); handleCancelEdit(); setIsCreating(false); setViewMode('hosted'); }}
                className={`font-mono text-[9px] tracking-widest uppercase cursor-pointer border-none bg-transparent ${
                  viewMode === 'hosted' ? 'text-[var(--color-ink)] font-bold' : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                My Listings
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 border border-[var(--color-hairline)] bg-[var(--color-paper-alt)]/40 hover:bg-[var(--color-paper-alt)] py-1.5 pl-2 pr-3 rounded-full cursor-pointer transition-colors duration-150"
              >
                {/* Dummy Avatar Circle */}
                <div className="w-6 h-6 rounded-full bg-[var(--color-presence)] text-[var(--color-paper)] flex items-center justify-center font-mono text-[10px] font-bold uppercase select-none">
                  {user.username.slice(0, 1)}
                </div>
                <span className="font-mono text-xs text-[var(--color-ink)] font-semibold uppercase tracking-wider">
                  {user.username}
                </span>
                <span className="text-[8px] text-[var(--color-ink-muted)] ml-0.5">▼</span>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-paper)] border border-[var(--color-hairline)] p-4 z-50 flex flex-col gap-3 rounded-none animate-fadeIn box-border">
                  <div className="flex flex-col select-none">
                    <span className="text-[9px] font-mono text-[var(--color-ink-muted)] uppercase tracking-wider">Signed in as</span>
                    <span className="text-xs font-mono text-[var(--color-ink)] font-semibold truncate uppercase mt-0.5">{user.username}</span>
                  </div>
                  <div className="h-[1px] w-full bg-[var(--color-hairline)]"></div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      setViewMode('all');
                    }}
                    className="w-full text-left font-sans text-xs text-[var(--color-alert)] hover:underline cursor-pointer border-none bg-transparent p-0 font-semibold"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onNavigateAuth}
              className="text-xs font-semibold uppercase tracking-wider hover:text-[var(--color-presence)] cursor-pointer font-sans transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-12 md:py-16 flex flex-col box-border">
        
        {/* Single Event Detail View */}
        {selectedEventId ? (
          <div className="animate-fadeIn w-full">
            <button
              onClick={() => { setSelectedEventId(null); handleCancelEdit(); }}
              className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors duration-150 mb-8 flex items-center gap-1.5 cursor-pointer font-sans select-none"
            >
              ← Back to catalog
            </button>

            {isDetailLoading ? (
              <div className="py-24 text-center select-none">
                <svg className="animate-spin h-6 w-6 text-[var(--color-presence)] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="font-sans text-xs uppercase tracking-wider text-[var(--color-ink-muted)]">Retrieving entry...</p>
              </div>
            ) : detailError ? (
              <div className="py-16 text-center select-none">
                <p className="font-sans text-sm text-[var(--color-alert)]">{detailError}</p>
              </div>
            ) : selectedEvent ? (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
                
                {/* Details Column */}
                <div className="lg:col-span-3">
                  <div className="mb-6 select-none">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-presence)] font-bold">
                      EVENT DETAILS
                    </span>
                  </div>

                  <h1 className="font-display text-4xl md:text-5xl font-semibold text-[var(--color-ink)] m-0 leading-tight tracking-tight">
                    {selectedEvent.title}
                  </h1>

                  {selectedEvent.description ? (
                    <p className="font-sans text-base text-[var(--color-ink-muted)] mt-8 leading-relaxed max-w-[650px] whitespace-pre-line">
                      {selectedEvent.description}
                    </p>
                  ) : (
                    <p className="font-sans text-sm italic text-[var(--color-ink-muted)] mt-8 leading-relaxed">
                      No description provided for this catalog entry.
                    </p>
                  )}

                  {/* Edit and Delete triggering */}
                  {user && String(user.id) === String(selectedEvent.created_by) && !editingEventId && new Date(selectedEvent.start_time) >= new Date() && (
                    <div className="mt-10 pt-6 border-t border-[var(--color-hairline)] flex items-center gap-3">
                      <button
                        onClick={() => handleEditInit(selectedEvent)}
                        className="font-sans text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-[4px] border border-[var(--color-ink)] hover:bg-[var(--color-paper-alt)] cursor-pointer transition-all duration-150"
                      >
                        Edit this event
                      </button>
                      {showDeleteConfirm ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(selectedEvent.id)}
                            disabled={actionLoading}
                            className="font-sans text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-[4px] bg-[var(--color-alert)] text-[var(--color-paper)] hover:opacity-90 cursor-pointer border-none"
                          >
                            Confirm delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={actionLoading}
                            className="text-xs text-[var(--color-ink-muted)] hover:underline cursor-pointer font-sans"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="font-sans text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-[4px] border border-[var(--color-alert)] text-[var(--color-alert)] hover:bg-[var(--color-alert)]/10 cursor-pointer transition-all duration-150"
                        >
                          Delete event
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-2 bg-[var(--color-paper-alt)]/30 border border-[var(--color-hairline)] p-8 rounded-none select-none flex flex-col gap-6">
                  <h4 className="font-mono text-[10px] tracking-widest uppercase text-[var(--color-ink-muted)] border-b border-[var(--color-hairline)] pb-3 mb-2 font-bold">
                    Schedule Info
                  </h4>

                  <div className="flex items-start gap-4">
                    <CalendarIcon />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[var(--color-ink-muted)] font-mono uppercase tracking-wider font-semibold">Date</span>
                      <span className="text-sm font-medium font-sans mt-0.5">
                        {parseEventDate(selectedEvent.start_time).fullDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <ClockIcon />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[var(--color-ink-muted)] font-mono uppercase tracking-wider font-semibold">Time</span>
                      <span className="text-sm font-mono mt-0.5">
                        {parseEventDate(selectedEvent.start_time).time}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPinIcon />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[var(--color-ink-muted)] font-mono uppercase tracking-wider font-semibold">Location</span>
                      <span className="text-sm font-sans mt-0.5">
                        {selectedEvent.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <UsersIcon />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[var(--color-ink-muted)] font-mono uppercase tracking-wider font-semibold">Capacity Limit</span>
                      <span className="text-sm font-mono mt-0.5">
                        {selectedEvent.capacity} spots available
                      </span>
                    </div>
                  </div>

                  {/* RSVP Actions Block */}
                  <div className="mt-4 pt-6 border-t border-[var(--color-hairline)] select-none">
                    {new Date(selectedEvent.start_time) < new Date() ? (
                      <p className="text-[10px] font-mono text-[var(--color-ink-muted)] text-center italic py-2">
                        This event has ended.
                      </p>
                    ) : !user ? (
                      <div>
                        <button
                          type="button"
                          onClick={onNavigateAuth}
                          className="w-full text-center font-sans text-xs font-semibold uppercase tracking-wider py-3 px-4 border border-[var(--color-ink)] hover:bg-[var(--color-paper-alt)] cursor-pointer rounded-[4px]"
                        >
                          Sign in to join
                        </button>
                        <p className="text-[10px] font-sans text-[var(--color-ink-muted)] text-center mt-2 leading-relaxed">
                          You must be authenticated to RSVP for this event.
                        </p>
                      </div>
                    ) : String(user.id) === String(selectedEvent.created_by) ? (
                      <p className="text-[10px] font-mono text-[var(--color-ink-muted)] text-center italic py-2">
                        You are hosting this event.
                      </p>
                    ) : (
                      <div>
                        {rsvpJoined ? (
                          <button
                            type="button"
                            onClick={() => handleLeaveEvent(selectedEvent.id)}
                            disabled={rsvpLoading}
                            className="w-full text-center font-sans text-xs font-semibold uppercase tracking-wider py-3 px-4 border border-[var(--color-alert)] text-[var(--color-alert)] hover:bg-[var(--color-alert)]/10 cursor-pointer rounded-[4px] disabled:opacity-50 transition-colors"
                          >
                            {rsvpLoading ? 'Leaving...' : 'Leave Event'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleJoinEvent(selectedEvent.id)}
                            disabled={rsvpLoading}
                            className="w-full text-center font-sans text-xs font-semibold uppercase tracking-wider py-3 px-4 bg-[var(--color-ink)] text-[var(--color-paper)] hover:opacity-90 cursor-pointer rounded-[4px] disabled:opacity-50 transition-all border-none"
                          >
                            {rsvpLoading ? 'Joining...' : 'Join Event'}
                          </button>
                        )}
                        {rsvpError && (
                          <p className="text-[10px] font-sans text-[var(--color-alert)] text-center mt-2.5 leading-normal max-w-[220px] mx-auto">
                            {rsvpError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Form block under details inside Detail Screen */}
                {editingEventId && (
                  <div className="lg:col-span-5 border-t border-[var(--color-hairline)] pt-12 mt-4 animate-fadeIn">
                    <div className="flex justify-between items-center mb-8 border-b border-[var(--color-hairline)] pb-3">
                      <h3 className="font-display text-xl font-semibold m-0">
                        Edit Event
                      </h3>
                      <button 
                        onClick={handleCancelEdit}
                        className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:underline cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleFormSubmit} noValidate className="max-w-[500px]">
                      {formErrors.non_field_errors && (
                        <div className="mb-6 p-3.5 bg-[var(--color-alert)]/10 border border-[var(--color-alert)]/20 text-[var(--color-alert)] font-sans text-sm rounded-[4px] text-center">
                          {formErrors.non_field_errors}
                        </div>
                      )}

                      <Input
                        label="Title"
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => handleFormInputChange('title', e.target.value)}
                        error={formErrors.title}
                        placeholder="Sat Night 5k Run"
                        disabled={actionLoading}
                      />

                      <div className="w-full flex flex-col mb-6">
                        <label htmlFor="description" className="font-sans text-[10px] text-[var(--color-ink-muted)] mb-1 uppercase tracking-wider font-semibold select-none">
                          Description
                        </label>
                        <textarea
                          id="description"
                          value={description}
                          onChange={(e) => handleFormInputChange('description', e.target.value)}
                          placeholder="Provide a detailed description of the schedule..."
                          disabled={actionLoading}
                          className="w-full bg-transparent text-[var(--color-ink)] border-b border-[var(--color-hairline)] focus:border-[var(--color-presence)] focus:outline-none py-2 px-0 font-sans text-base min-h-[80px] resize-none transition-colors duration-200 placeholder:text-[var(--color-ink-muted)]/30"
                        />
                      </div>

                      <Input
                        label="Location"
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => handleFormInputChange('location', e.target.value)}
                        error={formErrors.location}
                        placeholder="Riverside Park Pavilion"
                        disabled={actionLoading}
                      />

                      {/* Custom Picker Container */}
                      <div className="flex flex-col mb-6 relative" ref={calendarRef}>
                        <span className="font-sans text-[10px] text-[var(--color-ink-muted)] mb-1 uppercase tracking-wider font-semibold select-none">
                          Event Date
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => !actionLoading && setShowCalendar(!showCalendar)}
                          className={`w-full text-left bg-transparent text-[var(--color-ink)] border-b ${
                            formErrors.eventDate ? 'border-[var(--color-alert)]' : 'border-[var(--color-hairline)]'
                          } focus:border-[var(--color-presence)] py-2.5 font-sans text-base cursor-pointer`}
                        >
                          {formatDisplayDate(eventDate)}
                        </button>
                        
                        {formErrors.eventDate && (
                          <span className="font-sans text-xs text-[var(--color-alert)] mt-1.5 leading-normal">
                            {formErrors.eventDate}
                          </span>
                        )}

                        {/* Flat Popover Calendar */}
                        {showCalendar && (
                          <div className="absolute left-0 top-full mt-1.5 w-72 bg-[var(--color-paper)] border border-[var(--color-hairline)] z-50 p-4 box-border animate-fadeIn">
                            <div className="flex justify-between items-center mb-4 select-none">
                              <button
                                type="button"
                                onClick={() => handleMonthChange(-1)}
                                className="text-xs font-semibold hover:text-[var(--color-presence)] cursor-pointer py-1 px-2 border border-[var(--color-hairline)] rounded-[4px] bg-transparent"
                              >
                                ◄
                              </button>
                              <span className="font-sans text-xs font-semibold uppercase tracking-wider">
                                {monthNames[calMonth]} {calYear}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleMonthChange(1)}
                                className="text-xs font-semibold hover:text-[var(--color-presence)] cursor-pointer py-1 px-2 border border-[var(--color-hairline)] rounded-[4px] bg-transparent"
                              >
                                ►
                              </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] text-[var(--color-ink-muted)] mb-2 font-semibold select-none">
                              <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                              {days.map((d, idx) => {
                                const isDayDisabled = !d.current || d.isPast;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    disabled={isDayDisabled}
                                    onClick={() => {
                                      if (d.dateStr) {
                                        setEventDate(d.dateStr);
                                        setShowCalendar(false);
                                      }
                                    }}
                                    className={`py-1 text-center font-mono text-xs rounded-none transition-colors border-none bg-transparent ${
                                      isDayDisabled 
                                        ? 'text-[var(--color-ink-muted)]/20 cursor-not-allowed' 
                                        : d.dateStr === eventDate
                                          ? 'bg-[var(--color-presence)] text-[var(--color-paper)] font-bold'
                                          : 'hover:bg-[var(--color-paper-alt)] cursor-pointer text-[var(--color-ink)]'
                                    }`}
                                  >
                                    {d.day}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Custom 12h Time Stepper */}
                      <div className="w-full flex flex-col mb-8 select-none">
                        <span className="font-sans text-[10px] text-[var(--color-ink-muted)] mb-2.5 uppercase tracking-wider font-semibold">
                          Start Time
                        </span>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-[var(--color-hairline)] rounded-[4px] bg-[var(--color-paper)] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => adjustHour(-1)}
                              disabled={actionLoading}
                              className="px-3 py-2 text-sm font-semibold hover:bg-[var(--color-paper-alt)] cursor-pointer border-r border-[var(--color-hairline)] border-none bg-transparent disabled:opacity-50"
                            >
                              -
                            </button>
                            <span className="px-4 font-mono text-sm font-semibold w-10 text-center text-[var(--color-ink)]">
                              {hourVal}
                            </span>
                            <button
                              type="button"
                              onClick={() => adjustHour(1)}
                              disabled={actionLoading}
                              className="px-3 py-2 text-sm font-semibold hover:bg-[var(--color-paper-alt)] cursor-pointer border-l border-[var(--color-hairline)] border-none bg-transparent disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-semibold text-lg text-[var(--color-ink)]">:</span>

                          <div className="flex items-center border border-[var(--color-hairline)] rounded-[4px] bg-[var(--color-paper)] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => adjustMinute(-5)}
                              disabled={actionLoading}
                              className="px-3 py-2 text-sm font-semibold hover:bg-[var(--color-paper-alt)] cursor-pointer border-r border-[var(--color-hairline)] border-none bg-transparent disabled:opacity-50"
                            >
                              -
                            </button>
                            <span className="px-4 font-mono text-sm font-semibold w-10 text-center text-[var(--color-ink)]">
                              {String(minuteVal).padStart(2, '0')}
                            </span>
                            <button
                              type="button"
                              onClick={() => adjustMinute(5)}
                              disabled={actionLoading}
                              className="px-3 py-2 text-sm font-semibold hover:bg-[var(--color-paper-alt)] cursor-pointer border-l border-[var(--color-hairline)] border-none bg-transparent disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => !actionLoading && setAmpm((prev) => prev === 'AM' ? 'PM' : 'AM')}
                            disabled={actionLoading}
                            className="px-3.5 py-2 text-xs font-semibold uppercase tracking-wider border border-[var(--color-hairline)] rounded-[4px] bg-[var(--color-paper)] hover:bg-[var(--color-paper-alt)] cursor-pointer select-none disabled:opacity-50 text-[var(--color-ink)]"
                          >
                            {ampm}
                          </button>
                        </div>
                      </div>

                      <Input
                        label="Capacity limit"
                        id="capacity"
                        type="number"
                        value={capacity}
                        onChange={(e) => handleFormInputChange('capacity', e.target.value)}
                        error={formErrors.capacity}
                        placeholder="20"
                        disabled={actionLoading}
                        min="1"
                      />

                      <div className="mt-8 flex gap-3 items-center">
                        <div className="flex-1">
                          <Button type="submit" isLoading={actionLoading}>
                            Save changes
                          </Button>
                        </div>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={actionLoading}
                          className="font-sans text-xs font-semibold uppercase tracking-wider py-3 px-4 rounded-[4px] border border-[var(--color-hairline)] bg-transparent text-[var(--color-ink)] hover:border-[var(--color-ink)] cursor-pointer transition-all duration-150"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(editingEventId)}
                          disabled={actionLoading}
                          className="font-sans text-xs font-semibold uppercase tracking-wider py-3 px-4 rounded-[4px] border border-[var(--color-alert)] text-[var(--color-alert)] hover:bg-[var(--color-alert)]/10 cursor-pointer transition-all duration-150"
                        >
                          Delete
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              </div>
            ) : null}

          </div>
        ) : (
          /* Dashboard Directory list view */
          <div>
            <div className="flex justify-between items-end border-b border-[var(--color-hairline)] pb-6 mb-12 select-none">
              <div>
                <h1 className="font-display text-4xl md:text-5xl m-0 tracking-tight font-semibold">
                  {viewMode === 'mine' ? 'My Schedule' : viewMode === 'hosted' ? 'My Listings' : 'Events'}
                </h1>
                <p className="font-sans text-sm text-[var(--color-ink-muted)] mt-2 leading-relaxed">
                  {viewMode === 'mine' 
                    ? 'A list of gatherings you have reserved spots for.' 
                    : viewMode === 'hosted' 
                      ? 'Gatherings hosted and managed by you.' 
                      : 'A curated catalog of upcoming gatherings.'}
                </p>
              </div>
              
              {!editingEventId && viewMode !== 'mine' && (
                <button
                  onClick={handleCreateToggle}
                  className={`font-sans text-xs font-semibold uppercase tracking-wider py-3 px-5 rounded-[4px] border border-[var(--color-ink)] cursor-pointer transition-all duration-200 ${
                    isCreating 
                      ? 'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-paper-alt)]' 
                      : 'bg-[var(--color-ink)] text-[var(--color-paper)] hover:opacity-90'
                  }`}
                >
                  {isCreating ? 'Dismiss form' : '+ New event'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
              
              {/* Form Column left side (when creating) */}
              {isFormOpen && (
                <div className="lg:col-span-2 lg:border-r lg:border-[var(--color-hairline)] lg:pr-12 animate-fadeIn w-full">
                  <div className="flex justify-between items-center mb-8 border-b border-[var(--color-hairline)] pb-3 select-none">
                    <h3 className="font-display text-xl font-semibold m-0">
                      {editingEventId ? 'Edit Event' : 'Create Event'}
                    </h3>
                    {editingEventId && (
                      <button 
                        type="button"
                        onClick={handleCancelEdit}
                        className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:underline cursor-pointer bg-transparent border-none"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleFormSubmit} noValidate className="w-full">
                    {formErrors.non_field_errors && (
                      <div className="mb-6 p-3.5 bg-[var(--color-alert)]/10 border border-[var(--color-alert)]/20 text-[var(--color-alert)] font-sans text-sm rounded-[4px] text-center">
                        {formErrors.non_field_errors}
                      </div>
                    )}

                    <Input
                      label="Title"
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => handleFormInputChange('title', e.target.value)}
                      error={formErrors.title}
                      placeholder="Sat Night 5k Run"
                      disabled={actionLoading}
                    />

                    <div className="w-full flex flex-col mb-6">
                      <label htmlFor="description" className="font-sans text-[10px] text-[var(--color-ink-muted)] mb-1 uppercase tracking-wider font-semibold select-none">
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => handleFormInputChange('description', e.target.value)}
                        placeholder="Provide a detailed description of the schedule..."
                        disabled={actionLoading}
                        className="w-full bg-transparent text-[var(--color-ink)] border-b border-[var(--color-hairline)] focus:border-[var(--color-presence)] focus:outline-none py-2 px-0 font-sans text-base min-h-[80px] resize-none transition-colors duration-200 placeholder:text-[var(--color-ink-muted)]/30"
                      />
                    </div>

                    <Input
                      label="Location"
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => handleFormInputChange('location', e.target.value)}
                      error={formErrors.location}
                      placeholder="Riverside Park Pavilion"
                      disabled={actionLoading}
                    />

                    {/* Custom Picker Container */}
                    <div className="flex flex-col mb-6 relative" ref={calendarRef}>
                      <span className="font-sans text-[10px] text-[var(--color-ink-muted)] mb-1 uppercase tracking-wider font-semibold select-none">
                        Event Date
                      </span>
                      
                      <button
                        type="button"
                        onClick={() => !actionLoading && setShowCalendar(!showCalendar)}
                        className={`w-full text-left bg-transparent text-[var(--color-ink)] border-b ${
                          formErrors.eventDate ? 'border-[var(--color-alert)]' : 'border-[var(--color-hairline)]'
                        } focus:border-[var(--color-presence)] py-2.5 font-sans text-base cursor-pointer`}
                      >
                        {formatDisplayDate(eventDate)}
                      </button>
                      
                      {formErrors.eventDate && (
                        <span className="font-sans text-xs text-[var(--color-alert)] mt-1.5 leading-normal">
                          {formErrors.eventDate}
                        </span>
                      )}

                      {/* Flat Popover Calendar */}
                      {showCalendar && (
                        <div className="absolute left-0 top-full mt-1.5 w-72 bg-[var(--color-paper)] border border-[var(--color-hairline)] z-50 p-4 box-border animate-fadeIn">
                          <div className="flex justify-between items-center mb-4 select-none">
                            <button
                              type="button"
                              onClick={() => handleMonthChange(-1)}
                              className="text-xs font-semibold hover:text-[var(--color-presence)] cursor-pointer py-1 px-2 border border-[var(--color-hairline)] rounded-[4px] bg-transparent"
                            >
                              ◄
                            </button>
                            <span className="font-sans text-xs font-semibold uppercase tracking-wider">
                              {monthNames[calMonth]} {calYear}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleMonthChange(1)}
                              className="text-xs font-semibold hover:text-[var(--color-presence)] cursor-pointer py-1 px-2 border border-[var(--color-hairline)] rounded-[4px] bg-transparent"
                            >
                              ►
                            </button>
                          </div>

                          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] text-[var(--color-ink-muted)] mb-2 font-semibold select-none">
                            <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {days.map((d, idx) => {
                              const isDayDisabled = !d.current || d.isPast;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  disabled={isDayDisabled}
                                  onClick={() => {
                                    if (d.dateStr) {
                                      setEventDate(d.dateStr);
                                      setShowCalendar(false);
                                    }
                                  }}
                                  className={`py-1 text-center font-mono text-xs rounded-none transition-colors border-none bg-transparent ${
                                    isDayDisabled 
                                      ? 'text-[var(--color-ink-muted)]/20 cursor-not-allowed' 
                                      : d.dateStr === eventDate
                                        ? 'bg-[var(--color-presence)] text-[var(--color-paper)] font-bold'
                                        : 'hover:bg-[var(--color-paper-alt)] cursor-pointer text-[var(--color-ink)]'
                                  }`}
                                >
                                  {d.day}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Custom 12h Time Stepper */}
                    <div className="w-full flex flex-col mb-8 select-none">
                      <span className="font-sans text-[10px] text-[var(--color-ink-muted)] mb-2.5 uppercase tracking-wider font-semibold">
                        Start Time
                      </span>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-[var(--color-hairline)] rounded-[4px] bg-[var(--color-paper)] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => adjustHour(-1)}
                            disabled={actionLoading}
                            className="px-3 py-2 text-sm font-semibold hover:bg-[var(--color-paper-alt)] cursor-pointer border-r border-[var(--color-hairline)] border-none bg-transparent disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="px-4 font-mono text-sm font-semibold w-10 text-center text-[var(--color-ink)]">
                            {hourVal}
                          </span>
                          <button
                            type="button"
                            onClick={() => adjustHour(1)}
                            disabled={actionLoading}
                            className="px-3 py-2 text-sm font-semibold hover:bg-[var(--color-paper-alt)] cursor-pointer border-l border-[var(--color-hairline)] border-none bg-transparent disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-semibold text-lg text-[var(--color-ink)]">:</span>

                        <div className="flex items-center border border-[var(--color-hairline)] rounded-[4px] bg-[var(--color-paper)] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => adjustMinute(-5)}
                            disabled={actionLoading}
                            className="px-3 py-2 text-sm font-semibold hover:bg-[var(--color-paper-alt)] cursor-pointer border-r border-[var(--color-hairline)] border-none bg-transparent disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="px-4 font-mono text-sm font-semibold w-10 text-center text-[var(--color-ink)]">
                            {String(minuteVal).padStart(2, '0')}
                          </span>
                          <button
                            type="button"
                            onClick={() => adjustMinute(5)}
                            disabled={actionLoading}
                            className="px-3 py-2 text-sm font-semibold hover:bg-[var(--color-paper-alt)] cursor-pointer border-l border-[var(--color-hairline)] border-none bg-transparent disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => !actionLoading && setAmpm((prev) => prev === 'AM' ? 'PM' : 'AM')}
                          disabled={actionLoading}
                          className="px-3.5 py-2 text-xs font-semibold uppercase tracking-wider border border-[var(--color-hairline)] rounded-[4px] bg-[var(--color-paper)] hover:bg-[var(--color-paper-alt)] cursor-pointer select-none disabled:opacity-50 text-[var(--color-ink)]"
                        >
                          {ampm}
                        </button>
                      </div>
                    </div>

                    <Input
                      label="Capacity limit"
                      id="capacity"
                      type="number"
                      value={capacity}
                      onChange={(e) => handleFormInputChange('capacity', e.target.value)}
                      error={formErrors.capacity}
                      placeholder="20"
                      disabled={actionLoading}
                      min="1"
                    />

                    <div className="mt-8 flex gap-3 items-center">
                      <div className="flex-1">
                        <Button type="submit" isLoading={actionLoading}>
                          {editingEventId ? 'Save changes' : 'Publish event'}
                        </Button>
                      </div>
                      {editingEventId && (
                        <>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={actionLoading}
                            className="font-sans text-xs font-semibold uppercase tracking-wider py-3 px-4 rounded-[4px] border border-[var(--color-hairline)] bg-transparent text-[var(--color-ink)] hover:border-[var(--color-ink)] cursor-pointer transition-all duration-150"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(editingEventId)}
                            disabled={actionLoading}
                            className="font-sans text-xs font-semibold uppercase tracking-wider py-3 px-4 rounded-[4px] border border-[var(--color-alert)] text-[var(--color-alert)] hover:bg-[var(--color-alert)]/10 cursor-pointer transition-all duration-150"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                </div>
              )}

              <div className={`${isFormOpen ? 'lg:col-span-3' : 'lg:col-span-5'} w-full transition-all duration-300`}>
                
                {viewMode === 'mine' ? (
                  myEventsLoading ? (
                    <div className="py-24 text-center select-none">
                      <svg className="animate-spin h-6 w-6 text-[var(--color-presence)] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="font-sans text-xs uppercase tracking-wider text-[var(--color-ink-muted)]">Retrieving your schedule...</p>
                    </div>
                  ) : myEventsError ? (
                    <div className="py-20 text-center select-none">
                      <p className="font-sans text-sm text-[var(--color-alert)]">{myEventsError}</p>
                      <button
                        onClick={loadMyJoinedEvents}
                        className="mt-4 text-xs font-semibold uppercase tracking-wider underline text-[var(--color-ink)] hover:text-[var(--color-presence)] cursor-pointer bg-transparent border-none"
                      >
                        Try again
                      </button>
                    </div>
                  ) : myEventsList.length === 0 ? (
                    <div className="py-24 border border-[var(--color-hairline)] border-dashed text-center select-none">
                      <p className="font-sans text-sm text-[var(--color-ink-muted)]">You haven't joined any events yet.</p>
                      <button
                        onClick={() => setViewMode('all')}
                        className="mt-4 text-xs font-semibold uppercase tracking-wider underline text-[var(--color-ink)] hover:text-[var(--color-presence)] cursor-pointer bg-transparent border-none"
                      >
                        Explore Event Feed
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col border-t border-[var(--color-hairline)] animate-fadeIn">
                      {myEventsList.map((event) => {
                        const { day, month, time } = parseEventDate(event.start_time);
                        return (
                          <div 
                            key={event.id}
                            className="flex border-b border-[var(--color-hairline)] py-8 md:py-10 items-start gap-6 md:gap-8 hover:bg-[var(--color-paper-alt)]/25 transition-colors duration-150 cursor-pointer"
                            onClick={() => setSelectedEventId(event.id)}
                          >
                            {/* Left Side: Date stamp */}
                            <div className="flex flex-col items-center justify-center min-w-[60px] select-none text-center">
                              <span className="font-display text-4xl font-semibold text-[var(--color-presence)] leading-none tracking-tighter">
                                {day}
                              </span>
                              <span className="font-mono text-[9px] text-[var(--color-ink-muted)] tracking-widest mt-2 uppercase font-semibold">
                                {month}
                              </span>
                              <span className="font-mono text-[9px] text-[var(--color-ink-muted)] mt-1 opacity-70">
                                {time.split(' ')[0]}
                              </span>
                              <span className="font-mono text-[9px] text-[var(--color-ink-muted)] opacity-50 uppercase">
                                {time.split(' ')[1]}
                              </span>
                            </div>

                            {/* Structural vertical divider */}
                            <div className="w-[1px] self-stretch bg-[var(--color-hairline)]" onClick={(e) => e.stopPropagation()}></div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-4">
                                <h3 className="font-display text-xl font-semibold text-[var(--color-ink)] m-0 leading-snug hover:underline">
                                  {event.title}
                                </h3>
                                <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-[var(--color-presence)] bg-[var(--color-presence)]/10 px-2 py-0.5 border border-[var(--color-presence)]/20 select-none">
                                  Joined
                                </span>
                              </div>
                              
                              {event.description && (
                                <p className="font-sans text-sm text-[var(--color-ink-muted)] mt-2.5 leading-relaxed max-w-[600px] truncate">
                                  {event.description}
                                </p>
                              )}

                              {/* Metadata Row using icons instead of text labels */}
                              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-[11px] text-[var(--color-ink-muted)] select-none">
                                <span className="flex items-center gap-2">
                                  <MapPinIcon />
                                  <span className="text-[var(--color-ink)] font-medium font-sans">{event.location}</span>
                                </span>
                                <span className="flex items-center gap-2">
                                  <UsersIcon />
                                  <span className="font-mono text-[var(--color-ink)]">{event.capacity}</span>
                                </span>
                                <span className="flex items-center gap-2">
                                  <ClockIcon />
                                  <span className="font-mono text-[var(--color-ink)]">{time}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : viewMode === 'hosted' ? (
                  isLoading ? (
                    <div className="py-24 text-center select-none">
                      <svg className="animate-spin h-6 w-6 text-[var(--color-presence)] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="font-sans text-xs uppercase tracking-wider text-[var(--color-ink-muted)]">Retrieving listings...</p>
                    </div>
                  ) : fetchError ? (
                    <div className="py-20 text-center select-none">
                      <p className="font-sans text-sm text-[var(--color-alert)]">{fetchError}</p>
                      <button
                        onClick={loadEventsList}
                        className="mt-4 text-xs font-semibold uppercase tracking-wider underline text-[var(--color-ink)] hover:text-[var(--color-presence)] cursor-pointer bg-transparent border-none"
                      >
                        Try again
                      </button>
                    </div>
                  ) : events.filter(e => user && String(e.created_by) === String(user.id)).length === 0 ? (
                    <div className="py-24 border border-[var(--color-hairline)] border-dashed text-center select-none">
                      <p className="font-sans text-sm text-[var(--color-ink-muted)]">You aren't hosting any events yet.</p>
                      <button
                        onClick={handleCreateToggle}
                        className="mt-4 text-xs font-semibold uppercase tracking-wider underline text-[var(--color-ink)] hover:text-[var(--color-presence)] cursor-pointer bg-transparent border-none"
                      >
                        Create your first event
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col border-t border-[var(--color-hairline)] animate-fadeIn">
                      {events.filter(e => user && String(e.created_by) === String(user.id)).map((event) => {
                        const { day, month, time } = parseEventDate(event.start_time);
                        return (
                          <div 
                            key={event.id}
                            className="flex border-b border-[var(--color-hairline)] py-8 md:py-10 items-start gap-6 md:gap-8 hover:bg-[var(--color-paper-alt)]/25 transition-colors duration-150 cursor-pointer"
                            onClick={() => setSelectedEventId(event.id)}
                          >
                            {/* Left Side: Date stamp */}
                            <div className="flex flex-col items-center justify-center min-w-[60px] select-none text-center">
                              <span className="font-display text-4xl font-semibold text-[var(--color-presence)] leading-none tracking-tighter">
                                {day}
                              </span>
                              <span className="font-mono text-[9px] text-[var(--color-ink-muted)] tracking-widest mt-2 uppercase font-semibold">
                                {month}
                              </span>
                              <span className="font-mono text-[9px] text-[var(--color-ink-muted)] mt-1 opacity-70">
                                {time.split(' ')[0]}
                              </span>
                              <span className="font-mono text-[9px] text-[var(--color-ink-muted)] opacity-50 uppercase">
                                {time.split(' ')[1]}
                              </span>
                            </div>

                            {/* Structural vertical divider */}
                            <div className="w-[1px] self-stretch bg-[var(--color-hairline)]" onClick={(e) => e.stopPropagation()}></div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-4">
                                <h3 className="font-display text-xl font-semibold text-[var(--color-ink)] m-0 leading-snug hover:underline">
                                  {event.title}
                                </h3>
                                {new Date(event.start_time) >= new Date() && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditInit(event);
                                    }}
                                    className="text-[10px] font-semibold uppercase tracking-wider py-1 px-3 rounded-[4px] border border-[var(--color-hairline)] hover:border-[var(--color-ink)] cursor-pointer font-sans transition-all duration-150 select-none bg-transparent"
                                  >
                                    Edit
                                  </button>
                                )}
                              </div>
                              
                              {event.description && (
                                <p className="font-sans text-sm text-[var(--color-ink-muted)] mt-2.5 leading-relaxed max-w-[600px] truncate">
                                  {event.description}
                                </p>
                              )}

                              {/* Metadata Row using icons instead of text labels */}
                              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-[11px] text-[var(--color-ink-muted)] select-none">
                                <span className="flex items-center gap-2">
                                  <MapPinIcon />
                                  <span className="text-[var(--color-ink)] font-medium font-sans">{event.location}</span>
                                </span>
                                <span className="flex items-center gap-2">
                                  <UsersIcon />
                                  <span className="font-mono text-[var(--color-ink)]">{event.capacity}</span>
                                </span>
                                <span className="flex items-center gap-2">
                                  <ClockIcon />
                                  <span className="font-mono text-[var(--color-ink)]">{time}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  isLoading ? (
                    <div className="py-24 text-center select-none">
                      <svg className="animate-spin h-6 w-6 text-[var(--color-presence)] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="font-sans text-xs uppercase tracking-wider text-[var(--color-ink-muted)]">Retrieving entries...</p>
                    </div>
                  ) : fetchError ? (
                    <div className="py-20 text-center select-none">
                      <p className="font-sans text-sm text-[var(--color-alert)]">{fetchError}</p>
                      <button
                        onClick={loadEventsList}
                        className="mt-4 text-xs font-semibold uppercase tracking-wider underline text-[var(--color-ink)] hover:text-[var(--color-presence)] cursor-pointer"
                      >
                        Force reload
                      </button>
                    </div>
                  ) : events.filter(e => new Date(e.start_time) >= new Date()).length === 0 ? (
                    <div className="py-24 border border-[var(--color-hairline)] border-dashed text-center select-none">
                      <p className="font-sans text-sm text-[var(--color-ink-muted)]">No entries registered in the catalog.</p>
                      {user && (
                        <button
                          onClick={handleCreateToggle}
                          className="mt-4 text-xs font-semibold uppercase tracking-wider underline text-[var(--color-ink)] hover:text-[var(--color-presence)] cursor-pointer"
                        >
                          Draft first event
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col border-t border-[var(--color-hairline)] animate-fadeIn">
                      {events.filter(e => new Date(e.start_time) >= new Date()).map((event) => {
                        const { day, month, time } = parseEventDate(event.start_time);
                        const isOwner = user && String(user.id) === String(event.created_by);

                        return (
                          <div 
                            key={event.id}
                            className="flex border-b border-[var(--color-hairline)] py-8 md:py-10 items-start gap-6 md:gap-8 hover:bg-[var(--color-paper-alt)]/25 transition-colors duration-150 cursor-pointer"
                            onClick={() => setSelectedEventId(event.id)}
                          >
                            {/* Left Side: Date stamp */}
                            <div className="flex flex-col items-center justify-center min-w-[60px] select-none text-center">
                              <span className="font-display text-4xl font-semibold text-[var(--color-presence)] leading-none tracking-tighter">
                                {day}
                              </span>
                              <span className="font-mono text-[9px] text-[var(--color-ink-muted)] tracking-widest mt-2 uppercase font-semibold">
                                {month}
                              </span>
                              <span className="font-mono text-[9px] text-[var(--color-ink-muted)] mt-1 opacity-70">
                                {time.split(' ')[0]}
                              </span>
                              <span className="font-mono text-[9px] text-[var(--color-ink-muted)] opacity-50 uppercase">
                                {time.split(' ')[1]}
                              </span>
                            </div>

                            {/* Structural vertical divider */}
                            <div className="w-[1px] self-stretch bg-[var(--color-hairline)]" onClick={(e) => e.stopPropagation()}></div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-4">
                                <h3 className="font-display text-xl font-semibold text-[var(--color-ink)] m-0 leading-snug hover:underline">
                                  {event.title}
                                </h3>
                                {isOwner && new Date(event.start_time) >= new Date() && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditInit(event);
                                    }}
                                    className="text-[10px] font-semibold uppercase tracking-wider py-1 px-3 rounded-[4px] border border-[var(--color-hairline)] hover:border-[var(--color-ink)] cursor-pointer font-sans transition-all duration-150 select-none bg-transparent"
                                  >
                                    Edit
                                  </button>
                                )}
                              </div>
                              
                              {event.description && (
                                <p className="font-sans text-sm text-[var(--color-ink-muted)] mt-2.5 leading-relaxed max-w-[600px] truncate">
                                  {event.description}
                                </p>
                              )}

                              {/* Metadata Row using icons instead of text labels */}
                              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-[11px] text-[var(--color-ink-muted)] select-none">
                                <span className="flex items-center gap-2">
                                  <MapPinIcon />
                                  <span className="text-[var(--color-ink)] font-medium font-sans">{event.location}</span>
                                </span>
                                <span className="flex items-center gap-2">
                                  <UsersIcon />
                                  <span className="font-mono text-[var(--color-ink)]">{event.capacity}</span>
                                </span>
                                <span className="flex items-center gap-2">
                                  <ClockIcon />
                                  <span className="font-mono text-[var(--color-ink)]">{time}</span>
                                </span>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--color-hairline)] py-6 px-6 md:px-12 flex justify-between items-center select-none mt-auto">
        <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">
          METUPS PLATFORM © 2026
        </span>
        <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">
          STRICTLY MINIMALIST CATALOG
        </span>
      </footer>

      {/* Custom Confirmation Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-[var(--color-ink)]/15 backdrop-blur-[1px] z-[999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--color-paper)] border border-[var(--color-hairline)] w-full max-w-sm p-6 select-none box-border rounded-none">
            <h4 className="font-display text-lg font-semibold text-[var(--color-ink)] m-0 mb-2">
              {confirmDialog.title}
            </h4>
            <p className="font-sans text-sm text-[var(--color-ink-muted)] m-0 mb-6 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={confirmDialog.onCancel}
                className="font-sans text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-[4px] border border-[var(--color-hairline)] bg-transparent text-[var(--color-ink)] hover:border-[var(--color-ink)] transition-colors cursor-pointer"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`font-sans text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-[4px] border-none text-[var(--color-paper)] cursor-pointer transition-opacity hover:opacity-90 ${
                  confirmDialog.isDanger ? 'bg-[var(--color-alert)]' : 'bg-[var(--color-presence)]'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

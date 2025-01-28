import React, { useState, useEffect } from 'react';
import { styled } from '@mui/system';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Tooltip,
  Typography,
  IconButton,
  DialogActions,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAuth } from 'firebase/auth';

const url = 'https://nodejs-firebase-six.vercel.app';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

const CalendarWrapper = styled('div')({
  height: '100%',
  padding: '16px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

const priorityColors = {
  Alta: '#d32f2f', // Vermelho
  Média: '#f9a825', // Amarelo
  Baixa: '#388e3c', // Verde
};

const Legend = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '8px',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

const LegendItem = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const ColorBox = styled('div')(({ color }) => ({
  width: '16px',
  height: '16px',
  borderRadius: '4px',
  backgroundColor: color,
}));

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [users, setUsers] = useState([]); // Lista de usuários do Firestore

  const [eventData, setEventData] = useState({
    name: '',
    time: '',
    description: '',
    date: null,
    priority: '',
    participants: [],
  });

  // Lista de feriados brasileiros padrão
  const brazilianHolidays = [
    { title: 'Carnaval', date: '2025-02-12', description: 'Feriado Nacional' },
    { title: 'Sexta-feira Santa', date: '2025-03-28', description: 'Feriado Nacional' },
    { title: 'Municipal', date: '2025-04-04', description: 'Aniversário de Inocência' },
    { title: 'Tiradentes', date: '2025-04-21', description: 'Feriado Nacional' },
    { title: 'Dia do Trabalho', date: '2025-05-01', description: 'Feriado Nacional' },
    { title: 'Independência do Brasil', date: '2025-09-07', description: 'Feriado Nacional' },
    { title: 'Nossa Senhora Aparecida', date: '2025-10-12', description: 'Feriado Nacional' },
    { title: 'Finados', date: '2025-11-02', description: 'Feriado Nacional' },
    { title: 'Proclamação da República', date: '2025-11-15', description: 'Feriado Nacional' },
    { title: 'Natal', date: '2025-12-25', description: 'Feriado Nacional' },
    { title: 'Confraternização Universal', date: '2025-12-31', description: 'Ano Novo' },
  ];

  const auth = getAuth();

  const handleInputChange = (field, value) => {
    setEventData((prev) => ({ ...prev, [field]: value }));
  };

  const handleParticipantsChange = (selectedUsers) => {
    setEventData((prev) => ({ ...prev, participants: selectedUsers }));
  };

  const buildEventObject = (data) => {
    const fullDate = moment(data.date)
      .set({
        hour: moment(data.time, 'HH:mm').hours(),
        minute: moment(data.time, 'HH:mm').minutes(),
      })
      .toDate();

    return {
      ...data,
      date: fullDate.toISOString()
    };
  };

  const isEventDataValid = (data) => {
    if (!data.name || !data.time || !data.description || !data.date || !data.priority) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return false;
    }
    if (!data.participants || data.participants.length === 0) {
      alert('Por favor, selecione pelo menos um participante.');
      return false;
    }
    return true;
  };

  const toggleDialog = (isOpen) => setDialogOpen(isOpen);

  const handleEventOperation = async (type, data) => {
    try {
      setLoading(true);

      // Somente validar os dados do evento para operações de adicionar ou atualizar
      if (type !== 'delete' && !isEventDataValid(data)) {
        setLoading(false);
        return;
      }

      if (type === 'add') {
        // Adicionar o UID do criador ao evento
        const creatorId = auth.currentUser.uid;

        // Construir o objeto do evento
        const eventObject = {
          ...buildEventObject(data),
          creatorId, // Adicionando o creatorId
        };

        const token = await auth.currentUser.getIdToken();

        // Dados enviados ao backend
        const participantEmails = data.participants.map((user) => user.email);
        try {
          await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              eventName: data.name,
              eventDescription: data.description, // Descrição do evento
              eventDate: moment(data.date).format('DD/MM/YYYY'), // Formato da data
              eventTime: data.time, // Hora do evento
              participantEmails,
            }),
          });
        } catch (emailError) {
          console.error('Erro ao enviar e-mails:', emailError);
        }

        // Adicionar o evento ao Firestore
        const docRef = await addDoc(collection(db, 'events'), eventObject);
        setEvents((prev) => [
          ...prev,
          {
            id: docRef.id,
            title: data.name,
            start: new Date(eventObject.date),
            end: new Date(eventObject.date),
            description: data.description,
            priority: data.priority,
          },
        ]);
      } else if (type === 'update') {
        const eventRef = doc(db, 'events', data.id);
        const eventObject = buildEventObject(data);
        await updateDoc(eventRef, eventObject);

        setEvents((prev) =>
          prev.map((event) =>
            event.id === data.id
              ? {
                ...event,
                title: data.name,
                start: new Date(eventObject.date),
                end: new Date(eventObject.date),
                description: data.description,
                priority: data.priority,
              }
              : event
          )
        );
      } else if (type === 'delete') {
        // Excluir evento sem validações extras
        if (window.confirm('Tem certeza de que deseja excluir este evento?')) {
          const eventRef = doc(db, 'events', data.id);
          await deleteDoc(eventRef);
          setEvents((prev) => prev.filter((event) => event.id !== data.id));
        }
      }
    } catch (error) {
      console.error(`Erro ao executar operação ${type}:`, error);
    } finally {
      setLoading(false);
      toggleDialog(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users); // Supõe que o backend retorna um array de objetos { id, firstName, lastName, email }
        } else {
          console.error('Erro ao buscar usuários:', data.error);
        }
      } catch (error) {
        console.error('Erro ao conectar com o backend:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, 'events');
        const eventSnapshot = await getDocs(eventsCollection);
        const eventList = eventSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().name,
          start: new Date(doc.data().date),
          end: new Date(doc.data().date),
          description: doc.data().description,
          priority: doc.data().priority,
        }));

        // Adicionar feriados brasileiros ao estado dos eventos
        const holidayEvents = brazilianHolidays.map((holiday) => ({
          id: `holiday-${holiday.date}`,
          title: holiday.title,
          start: new Date(holiday.date),
          end: new Date(holiday.date),
          description: holiday.description,
          isHoliday: true, // Adiciona uma flag para diferenciar os feriados
        }));

        setEvents([...eventList, ...holidayEvents]);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }
    };
    fetchEvents();
  }, []);

  const handleCancel = () => {
    setEventData({
      name: '',
      time: '',
      description: '',
      date: null,
      priority: '',
      participants: [],
    });
    setEditingEvent(null);
    toggleDialog(false);
  };

  const handleSelectEvent = (event) => {
    setEditingEvent(event);
    setEventData({
      name: event.title,
      time: moment(event.start).format('HH:mm'),
      description: event.description || '',
      date: event.start,
      priority: event.priority || '',
    });
    toggleDialog(true);
  };

  const handleSlotSelect = (slotInfo) => {
    setEditingEvent(null); // Garante que não há evento em edição
    setEventData({
      name: '',
      time: '',
      description: '',
      date: slotInfo.start,
      priority: '',
      participants: [],
    });
    toggleDialog(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', margin: '0', padding: '0' }}>
      <CalendarWrapper style={{ flex: 7, padding: '0' }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          tooltipAccessor={(event) =>
            `Evento: ${event.title}\nHora: ${moment(event.start).format('HH:mm')}\nDescrição: ${event.description || 'Sem descrição'
            }\nPrioridade: ${event.priority || 'Sem prioridade'}`
          }
          onSelectSlot={handleSlotSelect}
          onSelectEvent={handleSelectEvent}
          style={{
            height: '100%',
            borderRadius: '8px',
          }}
          formats={{
            timeGutterFormat: 'HH:mm',
            eventTimeRangeFormat: ({ start, end }) =>
              `${moment(start).format('HH:mm')} – ${moment(end).format('HH:mm')}`,
          }}
          messages={{
            January: 'Janeiro',
            date: 'Data',
            time: 'Hora',
            event: 'Evento',
            allDay: 'Dia todo',
            week: 'Semana',
            work_week: 'Semana de trabalho',
            day: 'Dia',
            month: 'Mês',
            previous: 'Anterior',
            next: 'Próximo',
            yesterday: 'Ontem',
            tomorrow: 'Amanhã',
            today: 'Hoje',
            agenda: 'Agenda',
            noEventsInRange: 'Nenhum evento neste período.',
            showMore: (total) => `+ Ver mais (${total})`,
          }}
          components={{
            event: ({ event }) => (
              <Tooltip
                title={
                  <>
                    <Typography variant="subtitle2" style={{ fontWeight: 'bold' }}>
                      {event.title}
                    </Typography>
                    <Typography variant="body2">Descrição: {event.description || 'Sem descrição'}</Typography>
                  </>
                }
                placement="top"
              >
                <div
                  style={{
                    padding: '1px 6px',
                    backgroundColor: event.isHoliday ? '#2196f3' : priorityColors[event.priority] || '#1976d2',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: '#fff',
                  }}
                >
                  <Typography
                    variant="body2"
                    style={{
                      fontWeight: 'bold',
                      color: '#fff',
                    }}
                  >
                    {event.title}
                  </Typography>
                </div>
              </Tooltip>
            ),
          }}
        />
        <Dialog open={dialogOpen} onClose={() => toggleDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h6" style={{ fontWeight: 'bold', color: '#1976d2' }}>
              {editingEvent ? 'Atualizar Evento' : 'Adicionar Evento'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Nome do Evento"
              fullWidth
              value={eventData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              margin="normal"
              variant="outlined"
            />
            <TextField
              type="time"
              fullWidth
              value={eventData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="Descrição do Evento"
              fullWidth
              value={eventData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              margin="normal"
              variant="outlined"
              multiline
              rows={3}
            />
            <Select
              value={eventData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              fullWidth
              displayEmpty
              variant="outlined"
              margin="normal"
            >
              <MenuItem value="" disabled>
                Selecione a Prioridade
              </MenuItem>
              <MenuItem value="Alta">Alta</MenuItem>
              <MenuItem value="Média">Média</MenuItem>
              <MenuItem value="Baixa">Baixa</MenuItem>
            </Select>
            <Autocomplete
              multiple
              options={users}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
              onChange={(e, selectedUsers) => handleParticipantsChange(selectedUsers)}
              renderInput={(params) => (
                <TextField {...params} label="Participantes" placeholder="Selecione os participantes" variant="outlined" />
              )}
              style={{ marginTop: 16 }}
            />
          </DialogContent>
          <DialogActions>
            {editingEvent && (
              <IconButton
                onClick={() => handleEventOperation('delete', editingEvent)}
                color="error"
                style={{ marginRight: 'auto' }}
              >
                <DeleteIcon />
              </IconButton>
            )}
            <Button onClick={handleCancel} color="secondary" variant="outlined">
              Cancelar
            </Button>
            <Button
              onClick={() =>
                editingEvent
                  ? handleEventOperation('update', { ...eventData, id: editingEvent.id })
                  : handleEventOperation('add', eventData)
              }
              color="primary"
              variant="contained"
              disabled={loading}
            >
              {editingEvent ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogActions>
        </Dialog>
      </CalendarWrapper>

      {/* Legenda */}
      <Legend style={{ flex: 1.5, margin: '0', padding: '1em', fontSize: '0.85rem' }}>
        <Typography variant="h6" style={{ textAlign: 'center', marginBottom: '8px' }}>
          Legenda
        </Typography>
        <LegendItem>
          <ColorBox color="#d32f2f" />
          <Typography>Prioridade Alta</Typography>
        </LegendItem>
        <LegendItem>
          <ColorBox color="#f9a825" />
          <Typography>Prioridade Média</Typography>
        </LegendItem>
        <LegendItem>
          <ColorBox color="#388e3c" />
          <Typography>Prioridade Baixa</Typography>
        </LegendItem>
        <LegendItem>
          <ColorBox color="#2196f3" />
          <Typography>Feriados</Typography>
        </LegendItem>
      </Legend>
    </div>
  );
};

export default Calendar;

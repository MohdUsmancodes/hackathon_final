import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceManagement } from '../../services/serviceManagement';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

export const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    userName: '',
    userContact: '',
    description: '',
    status: 'pending'
  });

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const serviceData = await serviceManagement.getServiceById(id);
        const ticketsData = await serviceManagement.getServiceTickets(id);
        setService(serviceData);
        setTickets(ticketsData);
      } catch (error) {
        toast.error('Failed to fetch service details');
        console.error(error);
      }
    };

    fetchServiceDetails();
  }, [id]);

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      const ticketData = {
        ...ticketForm,
        serviceId: id,
        createdAt: new Date().toISOString(),
        ticketId: Math.random().toString(36).substr(2, 9)
      };

      await serviceManagement.createTicket(ticketData);
      setTickets([...tickets, ticketData]);
      setIsCreatingTicket(false);
      setTicketForm({
        userName: '',
        userContact: '',
        description: '',
        status: 'pending'
      });
      toast.success('Ticket created successfully');
    } catch (error) {
      toast.error('Failed to create ticket');
      console.error(error);
    }
  };

  const handleScanQR = async (ticketId) => {
    try {
      await serviceManagement.verifyTicket(ticketId);
      const updatedTickets = tickets.map(ticket =>
        ticket.ticketId === ticketId ? { ...ticket, status: 'verified' } : ticket
      );
      setTickets(updatedTickets);
      toast.success('Ticket verified successfully');
    } catch (error) {
      toast.error('Failed to verify ticket');
      console.error(error);
    }
  };

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{service.title}</h1>
            <p className="mt-2 text-gray-600">{service.description}</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-500">Category: {service.category}</p>
              <p className="text-sm text-gray-500">Price: ${service.price}</p>
              <p className="text-sm text-gray-500">Status: {service.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreatingTicket(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Ticket
          </button>
        </div>
      </div>

      {isCreatingTicket && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Ticket</h2>
          <form onSubmit={handleTicketSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={ticketForm.userName}
                onChange={(e) => setTicketForm({ ...ticketForm, userName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={ticketForm.userContact}
                onChange={(e) => setTicketForm({ ...ticketForm, userContact: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCreatingTicket(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Tickets</h2>
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.ticketId} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{ticket.userName}</h3>
                  <p className="text-sm text-gray-500">{ticket.userContact}</p>
                  <p className="text-sm text-gray-600 mt-2">{ticket.description}</p>
                  <p className="text-sm text-gray-500 mt-2">Status: {ticket.status}</p>
                </div>
                <div className="text-center">
                  <QRCodeSVG value={ticket.ticketId} size={100} />
                  <button
                    onClick={() => handleScanQR(ticket.ticketId)}
                    className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                  >
                    Verify Ticket
                  </button>
                </div>
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <p className="text-gray-500 text-center py-4">No tickets found</p>
          )}
        </div>
      </div>
    </div>
  );
}; 
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Upload, Calendar, MapPin } from 'lucide-react';

type ConcessionFormProps = {
  onSuccess: () => void;
};

export const ConcessionForm: React.FC<ConcessionFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    year: '',
    category: '',
    branch: '',
    fromStation: '',
    toStation: '',
    classType: '',
    railwayType: '',
    passType: '',
    dateOfBirth: '',
    concessionFormNo: '',
    age: '',
    previousPassDate: '',
    previousPassExpiry: '',
    seasonTicketNo: ''
  });
  const [idCardFile, setIdCardFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate age from date of birth
    if (name === 'dateOfBirth' && value) {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdCardFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}_${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('id-cards')
      .upload(fileName, file);

    if (error) {
      console.error('File upload error:', error);
      return null;
    }

    const { data } = supabase.storage
      .from('id-cards')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      let idCardUrl = null;
      if (idCardFile) {
        idCardUrl = await uploadFile(idCardFile);
      }

      const { error } = await supabase
        .from('concession_applications')
        .insert([{
          student_id: user.id,
          student_name: user.name || '',
          year: formData.year,
          category: formData.category,
          branch: formData.branch,
          from_station: formData.fromStation,
          to_station: formData.toStation,
          class_type: formData.classType,
          railway_type: formData.railwayType,
          pass_type: formData.passType,
          date_of_birth: formData.dateOfBirth,
          concession_form_no: formData.concessionFormNo,
          age: parseInt(formData.age),
          previous_pass_date: formData.previousPassDate,
          previous_pass_expiry: formData.previousPassExpiry,
          season_ticket_no: formData.seasonTicketNo,
          id_card_url: idCardUrl,
          status: 'pending'
        }]);

      if (error) throw error;

      // Reset form
      setFormData({
        year: '',
        category: '',
        branch: '',
        fromStation: '',
        toStation: '',
        classType: '',
        railwayType: '',
        passType: '',
        dateOfBirth: '',
        concessionFormNo: '',
        age: '',
        previousPassDate: '',
        previousPassExpiry: '',
        seasonTicketNo: ''
      });
      setIdCardFile(null);
      
      onSuccess();
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Train Concession Application Form</h2>
        <p className="text-sm text-gray-600">Fill in all required details for your concession application</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year <span className="text-red-500">*</span>
            </label>
            <select
              name="year"
              required
              value={formData.year}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Year</option>
              <option value="FE">FE (First Year)</option>
              <option value="SE">SE (Second Year)</option>
              <option value="TE">TE (Third Year)</option>
              <option value="BE">BE (Final Year)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              <option value="Open">Open</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch <span className="text-red-500">*</span>
            </label>
            <select
              name="branch"
              required
              value={formData.branch}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Branch</option>
              <option value="Civil">Civil Engineering</option>
              <option value="Computer">Computer Engineering</option>
              <option value="Chemical">Chemical Engineering</option>
              <option value="Electronics">Electronics Engineering</option>
              <option value="IT">Information Technology</option>
              <option value="Mechanical">Mechanical Engineering</option>
            </select>
          </div>
        </div>

        {/* Travel Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Station <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="fromStation"
                required
                value={formData.fromStation}
                onChange={handleInputChange}
                placeholder="e.g., Dadar"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Station <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="toStation"
                required
                value={formData.toStation}
                onChange={handleInputChange}
                placeholder="e.g., Wardha"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Class and Railway Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class <span className="text-red-500">*</span>
            </label>
            <select
              name="classType"
              required
              value={formData.classType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Class</option>
              <option value="1st Class">1st Class</option>
              <option value="2nd Class">2nd Class</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Railway <span className="text-red-500">*</span>
            </label>
            <select
              name="railwayType"
              required
              value={formData.railwayType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Railway</option>
              <option value="Central Railway">Central Railway</option>
              <option value="Western Railway">Western Railway</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pass Type <span className="text-red-500">*</span>
            </label>
            <select
              name="passType"
              required
              value={formData.passType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Pass Type</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
            </select>
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                name="dateOfBirth"
                required
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              placeholder="Auto-calculated"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Concession Form No. <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="concessionFormNo"
              required
              value={formData.concessionFormNo}
              onChange={handleInputChange}
              placeholder="e.g., CF2024001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Previous Pass Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Previous Pass Issue Date
            </label>
            <input
              type="date"
              name="previousPassDate"
              value={formData.previousPassDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Previous Pass Expiry Date
            </label>
            <input
              type="date"
              name="previousPassExpiry"
              value={formData.previousPassExpiry}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Season Ticket No.
            </label>
            <input
              type="text"
              name="seasonTicketNo"
              value={formData.seasonTicketNo}
              onChange={handleInputChange}
              placeholder="e.g., ST123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            College ID Card Copy <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="id-card"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input
                    id="id-card"
                    name="id-card"
                    type="file"
                    accept="image/*,.pdf"
                    required
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
              {idCardFile && (
                <p className="text-sm text-green-600 mt-2">
                  Selected: {idCardFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};
import { User, ArrowLeft} from "lucide-react";
import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import { observer } from 'mobx-react-lite';
import authStore from "../../store/authStore";
import toast from "react-hot-toast";

const AccountPreference = observer(() => {
  const formatDateForInput = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  console.log(authStore.user)
  const [formData, setFormData] = useState({
    name: authStore?.user?.name  || "",
    email: authStore?.user?.email  || "",
    phone: authStore?.user?.phone || "",
    gender: authStore?.user?.gender || "",
    date_of_birth: formatDateForInput(authStore?.user?.date_of_birth) || "",
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const normalizeDate = (date) => {
    if (!date) return "";
    return date.split("T")[0]; // keep only YYYY-MM-DD
  };

  const handleUpdate = async () => {
    try {
      const changedFields = Object.keys(formData).reduce((acc, key) => {
        let originalValue = authStore.user[key];

        // Special handling for date_of_birth
        if (key === "date_of_birth") {
          originalValue = normalizeDate(originalValue);
        }

        const newValue = formData[key];

        if (newValue !== (originalValue ?? "")) {
          acc[key] = newValue;
        }

        return acc;
      }, {});

      if (Object.keys(changedFields).length === 0) {
        console.log("No changes to update");
        return;
      }

      const res = await authStore.updateProfile(changedFields);
      toast.success("Update successful")

      console.log(res);
    } catch (err) {
      console.error(err);
      toast.error("Update failed")
    }
  };


  return (
    <div className="w-full p-8 bg-dark-10 rounded-2xl">
      <div className="container">

        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <User className="w-5 h-5" style={{ color: 'var(--color-gray-70)' }} />
          <h1 className="text-xl font-medium" style={{ color: 'var(--color-gray-90)' }}>Account preferences</h1>
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="min-w-16 h-16 font-semibold text-2xl flex items-center justify-center rounded-full overflow-hidden bg-dark-15" >{authStore.user?.name[0]}</div>
          </div>

          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
              style={{
                backgroundColor: 'var(--color-brown-60)',
                color: 'white',
                borderColor: 'var(--color-brown-60)'
              }}
            >
              Change
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-brown-70)',
                borderColor: 'var(--color-brown-70)'
              }}
            >
              Remove
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* First Name & Location Row */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-gray-80)' }}>
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-dark-12)',
                  borderColor: 'var(--color-dark-25)',
                  color: 'var(--color-gray-90)',
                  '--tw-ring-color': 'var(--color-brown-70)'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-gray-80)' }}>
                Email
              </label>
              <div className="relative opacity-75 cursor-not-allowed">
                <input
                  disabled
                  type="text"
                  value={formData.email}
                  // onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-dark-12)',
                    borderColor: 'var(--color-dark-25)',
                    color: 'var(--color-gray-90)',
                    '--tw-ring-color': 'var(--color-brown-70)'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-gray-80)' }}>
                Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-dark-12)',
                  borderColor: 'var(--color-dark-25)',
                  color: 'var(--color-gray-90)',
                  '--tw-ring-color': 'var(--color-brown-70)'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-gray-80)' }}>
                gender
              </label>
              <select
                className={'w-full px-4 py-3 rounded-lg border border-dark-25 bg-dark-12 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brown-65'}
                name="gender"
                id="gender"
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <option value={formData.gender} hidden>{formData.gender}</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>

              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-gray-80)' }}>
              Birth Day
            </label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-dark-12)',
                borderColor: 'var(--color-dark-25)',
                color: 'var(--color-gray-90)',
                '--tw-ring-color': 'var(--color-brown-70)'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-300"
              style={{
                backgroundColor: 'transparent',
                border: `1px solid var(--color-dark-30)`
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'var(--color-brown-60)',
                color: 'white'
              }}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AccountPreference;
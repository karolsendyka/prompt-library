import React from "react";

export function UpdatePasswordForm() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center">Set New Password</h3>
        <p className="mt-2 text-center text-gray-600">
          Enter and confirm your new password.
        </p>
        <form>
          <div className="mt-4">
            <div>
              <label className="block" htmlFor="newPassword">New Password</label>
              <input
                type="password"
                placeholder="New Password"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                id="newPassword"
                required
              />
            </div>
            <div className="mt-4">
              <label className="block" htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                id="confirmPassword"
                required
              />
            </div>
            <div className="flex items-baseline justify-between">
              <button
                type="submit"
                className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900"
              >
                Set Password
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

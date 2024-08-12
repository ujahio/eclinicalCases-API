import React from "react"
import { PasswordField } from "../form-elements"
import Button from "../ui/Button"

const PasswordSettings = () => {
  return (
    <form>
      <PasswordField
        label="Current Password"
        name="currentPassword"
        placeholder="Enter Password"
      />
      <PasswordField
        label="Choose New Password"
        name="password"
        placeholder="Enter Password"
      />
      <PasswordField
        label="Confirm New Password"
        name="password_confirmation"
        placeholder="Enter Password"
      />
      <div className="mt-8">
        <Button block>
          Save Changes
          <svg width="12" viewBox="0 0 18.352 14">
            <path
              d="M12.659,22.217,8.307,17.865,6.83,19.341l5.829,5.829L25.182,12.647,23.705,11.17Z"
              transform="translate(-6.83 -11.17)"
              fill="#fff"
            />
          </svg>
        </Button>
      </div>
    </form>
  )
}

export default PasswordSettings

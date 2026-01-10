import React from 'react'
import Logo from '@/assets/images/logo.jpeg';
import { FloatingWhatsApp } from 'react-floating-whatsapp'

const Whatsapp = () => {
  return (
    <div>
      <FloatingWhatsApp
        phoneNumber="9787755755"
        accountName="Hp Fitness Studio Unisex"
        avatar={Logo}
        statusMessage="Online"
        chatMessage="Welcome to Hp Fitness Studio Unisex! 💪 Ready to crush your goals?"
        placeholder="Type a message..."
        darkMode={true}
        allowEsc
        allowClickAway
      />
    </div>
  )
}

export default Whatsapp
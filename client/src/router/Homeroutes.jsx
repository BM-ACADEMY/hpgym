import Footer from '@/components/Layout/Footer'
import Navbar from '@/components/Layout/Navbar'
import AboutSection from '@/components/pages/AboutSection'
import GymGallery from '@/components/pages/Gallery'
import HomeSection from '@/components/pages/Home'
import ServicesSection from '@/components/pages/Services'
import TestimonialSection from '@/components/pages/Testimonial'
import React from 'react'

const Homeroutes = () => {
  return (
    <div>
        <Navbar/>
        <HomeSection/>
        <AboutSection/>
        <ServicesSection/>
        <TestimonialSection/>
        <GymGallery/>
        <Footer/>
    </div>
  )
}

export default Homeroutes
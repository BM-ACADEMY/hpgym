import Footer from '@/components/Layout/Footer'
import Navbar from '@/components/Layout/Navbar'
import AboutSection from '@/components/pages/AboutSection'
import Enquirypage from '@/components/pages/Enquirysection'
import GymGallery from '@/components/pages/Gallery'
import HomeSection from '@/components/pages/Home'
import ServicesSection from '@/components/pages/Services'
import TestimonialSection from '@/components/pages/Testimonial'
import WhyChooseUs from '@/components/pages/whychoose'
import React from 'react'

const Homeroutes = () => {
  return (
    <div>
        <Navbar/>
        <HomeSection/>
        <AboutSection/>
        <ServicesSection/>
        <WhyChooseUs/>

        <TestimonialSection/>
        <GymGallery/>
        <Enquirypage/>
        <Footer/>
    </div>
  )
}

export default Homeroutes
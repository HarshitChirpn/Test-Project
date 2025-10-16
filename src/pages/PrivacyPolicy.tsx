import { HeroHeader } from "@/components/ui/hero-section-4";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <HeroHeader />
      <main className="pt-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] mt-16">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover object-center"
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Privacy Policy"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-6xl mx-auto px-6 w-full text-center">
            <h1 className="text-5xl font-bold text-white md:text-6xl lg:text-7xl leading-tight">
              Privacy Policy
            </h1>
            <p className="mt-6 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              How we collect, use, and protect your personal information
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <div className="space-y-8">
              <section>
                <h2 className="text-3xl font-bold mb-4">Compliance</h2>
                <p className="text-muted-foreground leading-relaxed">
                  This Privacy Policy describes how idea2mvp ("we," "us," or "our") collects, uses, and shares 
                  personal information when you use our website and services. We are committed to protecting 
                  your privacy and ensuring compliance with applicable data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Collection of Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect information you provide directly to us, such as when you:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Create an account or register for our services</li>
                  <li>Contact us through our forms or email</li>
                  <li>Subscribe to our newsletter or marketing communications</li>
                  <li>Participate in surveys, contests, or promotional activities</li>
                  <li>Use our website and services</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  This information may include your name, email address, phone number, company information, 
                  project details, and any other information you choose to provide.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Sharing of Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  without your consent, except in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>To service providers who assist us in operating our website and conducting our business</li>
                  <li>When required by law or to protect our rights and safety</li>
                  <li>In connection with a business transfer or acquisition</li>
                  <li>With your explicit consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Legal Basis of Processing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We process your personal information based on the following legal grounds:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                  <li>Performance of a contract when providing our services</li>
                  <li>Legitimate interests in operating and improving our business</li>
                  <li>Compliance with legal obligations</li>
                  <li>Your consent for specific processing activities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Use of Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send marketing communications (with your consent)</li>
                  <li>Respond to your comments, questions, and customer service requests</li>
                  <li>Monitor and analyze usage patterns and trends</li>
                  <li>Prevent fraudulent activities and ensure security</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">International Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your information may be transferred to and processed in countries other than your country 
                  of residence. We ensure that such transfers are conducted in accordance with applicable 
                  data protection laws and with appropriate safeguards in place.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Information Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal 
                  information against unauthorized access, disclosure, alteration, or destruction. However, 
                  no method of transmission over the internet or electronic storage is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Marketing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  With your consent, we may send you marketing communications about our services, industry 
                  insights, and other relevant information. You can opt out of these communications at any 
                  time by using the unsubscribe link in our emails or contacting us directly.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Links to Third Parties</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our website may contain links to third-party websites. We are not responsible for the 
                  privacy practices or content of these external sites. We encourage you to review the 
                  privacy policies of any third-party sites you visit.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Your Data Protection Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Right to access your personal information</li>
                  <li>Right to rectify inaccurate or incomplete information</li>
                  <li>Right to erase your personal information in certain circumstances</li>
                  <li>Right to restrict or object to processing</li>
                  <li>Right to data portability</li>
                  <li>Right to withdraw consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your browsing experience, 
                  analyze website traffic, and understand where our visitors are coming from. You can 
                  control cookie preferences through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Changes to the Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes 
                  by posting the new Privacy Policy on this page and updating the "Last Updated" date. 
                  Your continued use of our services after any changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Contact Details</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-muted/20 p-6 rounded-lg">
                  <p className="text-muted-foreground">
                    <strong>idea2mvp</strong><br />
                    983 Corporate Way<br />
                    Fremont, CA 94555<br />
                    Email: contact@idea2mvp.com<br />
                    Phone: +1 (585) 755-3200
                  </p>
                </div>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  <strong>Last Updated:</strong> January 1, 2024
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
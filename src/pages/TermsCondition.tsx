import { HeroHeader } from "@/components/ui/hero-section-4";
import Footer from "@/components/Footer";

const TermsCondition = () => {
  return (
    <div className="min-h-screen">
      <HeroHeader />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-dark text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Terms of Use
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Legal terms and conditions for using our services
            </p>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <div className="space-y-8">
                <section>
                  <h2 className="text-3xl font-bold mb-4">
                    Acceptance of Terms
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Welcome to idea2mvp. These Terms of Use ("Terms") govern
                    your use of our website, services, and any related
                    applications or platforms operated by idea2mvp ("Company,"
                    "we," "us," or "our"). By accessing or using our services,
                    you agree to be bound by these Terms. If you do not agree to
                    these Terms, please do not use our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold mb-4">
                    Site Content and Use
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    The content on this website, including but not limited to
                    text, graphics, images, logos, and software, is the property
                    of idea2mvp and is protected by copyright, trademark, and
                    other intellectual property laws. You may use our website
                    for personal and commercial purposes, subject to the
                    following restrictions:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>
                      You may not reproduce, distribute, or create derivative
                      works without our written consent
                    </li>
                    <li>
                      You may not use our services for any unlawful or
                      unauthorized purpose
                    </li>
                    <li>
                      You may not interfere with or disrupt the security or
                      functionality of our services
                    </li>
                    <li>
                      You may not attempt to gain unauthorized access to our
                      systems or networks
                    </li>
                    <li>
                      You may not use automated systems to access our services
                      without permission
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-3xl font-bold mb-4">
                    User Accounts and Responsibilities
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    When you create an account with us, you are responsible for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>
                      Providing accurate, current, and complete information
                    </li>
                    <li>
                      Maintaining the security and confidentiality of your
                      account credentials
                    </li>
                    <li>
                      Notifying us immediately of any unauthorized use of your
                      account
                    </li>
                    <li>All activities that occur under your account</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-3xl font-bold mb-4">
                    Services and Payment Terms
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Our services include MVP development, design, marketing, and
                    related consulting services. By purchasing our services, you
                    agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>
                      Pay all fees and charges associated with your selected
                      plan
                    </li>
                    <li>
                      Provide necessary information and cooperation for project
                      completion
                    </li>
                    <li>
                      Comply with project timelines and communication
                      requirements
                    </li>
                    <li>
                      Accept that deliverables may vary based on project scope
                      and requirements
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-3xl font-bold mb-4">
                    Notices of Infringement
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you believe that any content on our website infringes
                    your intellectual property rights, please contact us
                    immediately with the following information:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                    <li>
                      A description of the copyrighted work or intellectual
                      property that you claim has been infringed
                    </li>
                    <li>
                      A description of where the allegedly infringing material
                      is located on our website
                    </li>
                    <li>
                      Your contact information, including address, telephone
                      number, and email address
                    </li>
                    <li>
                      A statement that you have a good faith belief that the
                      disputed use is not authorized
                    </li>
                    <li>
                      A statement that the information in your notice is
                      accurate and that you are authorized to act on behalf of
                      the owner
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-3xl font-bold mb-4">Disclaimers</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Our services are provided "as is" and "as available" without
                    warranties of any kind, either express or implied. We
                    disclaim all warranties, including but not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>
                      Warranties of merchantability, fitness for a particular
                      purpose, and non-infringement
                    </li>
                    <li>
                      Warranties that our services will be uninterrupted,
                      error-free, or secure
                    </li>
                    <li>
                      Warranties regarding the accuracy, reliability, or
                      completeness of any content
                    </li>
                    <li>
                      Warranties that defects will be corrected or that our
                      services are free of viruses
                    </li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    We do not guarantee that your use of our services will
                    result in any particular business outcomes, revenue, or
                    success. Results may vary based on numerous factors beyond
                    our control.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold mb-4">
                    Limitation of Liability
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To the maximum extent permitted by law, idea2mvp shall not
                    be liable for any indirect, incidental, special,
                    consequential, or punitive damages, including but not
                    limited to loss of profits, data, use, goodwill, or other
                    intangible losses, resulting from your use of our services,
                    even if we have been advised of the possibility of such
                    damages.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold mb-4">Indemnification</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You agree to defend, indemnify, and hold harmless idea2mvp
                    and its officers, directors, employees, and agents from and
                    against any claims, damages, obligations, losses,
                    liabilities, costs, or debt arising from your use of our
                    services or violation of these Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold mb-4">
                    Third-Party Websites
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our website may contain links to third-party websites or
                    services that are not owned or controlled by idea2mvp. We
                    have no control over and assume no responsibility for the
                    content, privacy policies, or practices of any third-party
                    websites or services. You acknowledge and agree that we
                    shall not be responsible for any damage or loss caused by
                    your use of any third-party websites or services.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold mb-4">Termination</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may terminate or suspend your account and access to our
                    services immediately, without prior notice or liability, for
                    any reason, including breach of these Terms. Upon
                    termination, your right to use our services will cease
                    immediately.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold mb-4">
                    Governing Law; Jurisdiction
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms shall be interpreted and governed by the laws of
                    the State of California, without regard to its conflict of
                    law provisions. Any legal suit, action, or proceeding
                    arising out of or related to these Terms or our services
                    shall be instituted exclusively in the federal courts of
                    Santa Clara County, California, or the courts of the State
                    of California in Milpitas, California.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold mb-4">Changes to Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to modify or replace these Terms at any
                    time. If a revision is material, we will try to provide at
                    least 30 days notice prior to any new terms taking effect.
                    Your continued use of our services after any changes
                    constitutes acceptance of the new Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold mb-4">
                    Contact Information
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    If you have any questions about these Terms, please contact
                    us:
                  </p>
                  <div className="bg-muted/20 p-6 rounded-lg">
                    <p className="text-muted-foreground">
                      <strong>idea2mvp</strong>
                      <br />
                      983 Corporate Way
                      <br />
                      Fremont, CA 94555
                      <br />
                      Email: contact@idea2mvp.com
                      <br />
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

export default TermsCondition;

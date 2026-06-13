import Link from "next/link";
import { ArrowRight, BookOpen, Target, Compass, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 bg-grid-pattern py-16 text-slate-300">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-400 block mb-2">About Our Chapter</span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Demystifying Cloud at <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">RIMT</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Empowering students to innovate, construct, and launch production systems utilizing modern Amazon Web Services.
          </p>
        </div>

        {/* Vision / Mission grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="rounded-xl border border-slate-900 bg-slate-950/70 p-8 shadow-sm hover:border-slate-800 transition-all">
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 w-fit mb-6">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Our Mission</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              To bridge the gap between academic theories and modern cloud engineering. We supply the resources, sandbox workshops, and developer mentorship needed to build production-grade web infrastructures, Generative AI pipelines, and secure cloud endpoints.
            </p>
          </div>

          <div className="rounded-xl border border-slate-900 bg-slate-950/70 p-8 shadow-sm hover:border-blue-500/30 hover:shadow-blue-500/[0.02] transition-all">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 w-fit mb-6">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Our Vision</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              To establish RIMT University as a central hub of cloud technology excellence in Punjab. We nurture a collaborative network of certified practitioners, serverless developers, and ML researchers who leverage cloud architectures to resolve critical real-world challenges.
            </p>
          </div>
        </div>

        {/* Sponsor/Advisor Highlight */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-950/80 p-8 md:p-10 shadow-xl mb-16">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/[0.01] rounded-full blur-3xl pointer-events-none"></div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white tracking-tight">Institutional Support</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The AWS Student Builder Group operates officially under the guidance of the **Department of Computer Science & Engineering (CSE)** at RIMT University. Under this sponsorship, CSE students gain exclusive access to technical seminars, certified curriculum support, and cloud sandbox credits.
            </p>
            <div className="pt-2">
              <Link href="/team" className="text-xs text-orange-400 hover:text-orange-300 font-semibold inline-flex items-center gap-1">
                Meet the Leadership Team
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Academic Alignment */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white tracking-tight border-b border-slate-900 pb-3">Academic Integration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-200 tracking-tight">1. AWS Academy Curriculum</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our bootcamps and workshop sessions align with official AWS Academy guidelines to ensure students are prepared for CCP and SAA certifications.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-200 tracking-tight">2. Hands-on Sandbox Labs</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                We organize local practice labs where students configure cloud assets inside risk-free sandbox environments without bill shock.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-200 tracking-tight">3. GenAI Innovation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                By leveraging Amazon Bedrock, PartyRock, and AWS Bedrock API tokens, students construct next-gen AI applications.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

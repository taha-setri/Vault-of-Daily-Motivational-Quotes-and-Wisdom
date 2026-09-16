import React from 'react';
import { X, Shield, FileText, Database, UserCheck, CheckCircle2, Lock, Cpu, Globe } from 'lucide-react';
import { LegalModalType, Language } from '../types';
import { UI_TRANSLATIONS } from '../utils/i18n';

interface LegalModalsProps {
  activeModal: LegalModalType;
  onClose: () => void;
  language?: Language;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ activeModal, onClose, language = 'ar' }) => {
  if (!activeModal) return null;
  const t = UI_TRANSLATIONS[language];
  const isEn = language === 'en';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-2xl bg-[#0b0f19] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.18)] overflow-hidden text-slate-200 ${
          isEn ? 'text-left' : 'text-right'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ambient Line */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

        {/* Modal Top */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <button
            id="btn-close-legal-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {activeModal === 'privacy' && (
              <>
                <h3 className="text-lg font-bold text-cyan-300">
                  {isEn ? 'Privacy Policy & Data Protection' : 'سياسة الخصوصية وحماية البيانات'}
                </h3>
                <Shield className="w-5 h-5 text-cyan-400" />
              </>
            )}
            {activeModal === 'disclaimer' && (
              <>
                <h3 className="text-lg font-bold text-purple-300">
                  {isEn ? 'Legal & Intellectual Disclaimer' : 'إخلاء المسؤولية القانونية والفكرية'}
                </h3>
                <FileText className="w-5 h-5 text-purple-400" />
              </>
            )}
            {activeModal === 'cookies' && (
              <>
                <h3 className="text-lg font-bold text-emerald-300">
                  {isEn ? 'Cookies & Local Storage Policy' : 'ملفات تعريف الارتباط وتخزين البيانات'}
                </h3>
                <Database className="w-5 h-5 text-emerald-400" />
              </>
            )}
            {activeModal === 'founder' && (
              <>
                <h3 className="text-lg font-bold text-cyan-300">
                  {isEn ? 'About the Platform & Founder: Taha setri' : 'عن المنظومة والمؤسس: Taha setri'}
                </h3>
                <UserCheck className="w-5 h-5 text-cyan-400" />
              </>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4 text-sm leading-relaxed text-slate-300">
          {activeModal === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 text-xs flex items-center gap-3">
                <Lock className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>
                  {isEn
                    ? 'Secure Local Storage Architecture: Your personal reflections, bookmarks, and preferences reside strictly on your local browser sandbox—never broadcast to third-party databases.'
                    : 'نظام التخزين المحلي الآمن: تأملاتك وملاحظاتك تحفظ محلياً على جهازك دون إرسالها لأي خوادم خارجية طرف ثالث.'}
                </span>
              </div>

              <h4 className="text-base font-semibold text-white">
                {isEn ? '1. Absolute Privacy Guarantee' : '1. التزامنا التام بالخصوصية'}
              </h4>
              <p>
                {isEn
                  ? 'Daily Cyber Wisdom Vault is built with fundamental respect for personal autonomy and thought privacy. We require zero accounts, zero tracking cookies, and zero personally identifiable information (PII) harvesting.'
                  : 'تم تصميم منصة "خزنة الاقتباسات والحكم التحفيزية اليومية" باحترام صارم لخصوصية المستخدم وحرية أفكاره. المنصة لا تطلب أي تسجيل دخول إجباري ولا تجمع بيانات هوية شخصية (PII).'}
              </p>

              <h4 className="text-base font-semibold text-white">
                {isEn ? '2. Personal Notes & Reflections Vault' : '2. الملاحظات والتأملات الشخصية'}
              </h4>
              <p>
                {isEn
                  ? 'All entries in the Reflections Vault are stored directly in your browser using HTML5 LocalStorage. You maintain full sovereignty over your reflections, with one-click export and purge controls available at all times.'
                  : 'عند تدوين أي فكرة أو تأمل في صندوق التأملات الشخصية، يتم تخزين النصوص حصرياً داخل متصفحك عبر تقنية التخزين المحلي (HTML5 LocalStorage). أنت المتحكم الوحيد في مسحها أو تعديلها في أي وقت.'}
              </p>

              <h4 className="text-base font-semibold text-white">
                {isEn ? '3. External Network Links' : '3. الروابط الخارجية ومواقع الشبكة'}
              </h4>
              <p>
                {isEn
                  ? 'The top navigation network links out to verified sister platforms within our digital ecosystem, such as Cyber Brain Games. Once visiting external domains, their respective terms apply.'
                  : 'يحتوي شريط الشبكة على روابط خارجية لمشاريع شقيقة تابعة لنفس المنظومة الإبداعية، بما في ذلك موقع "ألعاب العقل السيبراني". خضوعك لسياسات المواقع الخارجية يسري بمجرد انتقالك إليها.'}
              </p>
            </div>
          )}

          {activeModal === 'disclaimer' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-purple-200 text-xs flex items-center gap-3">
                <Cpu className="w-5 h-5 text-purple-400 shrink-0" />
                <span>
                  {isEn
                    ? 'Content is curated for intellectual inspiration, philosophical mindfulness, and self-actualization.'
                    : 'المحتوى مخصص للإلهام الذهني، والتطوير الذاتي، والتأمل الفلسفي البناء.'}
                </span>
              </div>

              <h4 className="text-base font-semibold text-white">
                {isEn ? '1. Purpose & Creative Intent' : '1. الغرض المعرفي والتحفيزي'}
              </h4>
              <p>
                {isEn
                  ? 'The quotes, aphorisms, and synthesized reflections on this platform celebrate millennia of human thought, literature, and scientific inquiry. They are presented for inspirational and reflective purposes, not as professional psychological, legal, or medical counsel.'
                  : 'جميع الاقتباسات والحكم والمعلومات المعروضة في المنصة منتقاة من التراث الإنساني والفلسفي والعلمي، أو مولدة إبداعياً لتحفيز التفكير الإيجابي والوعي الذاتي. لا تشكل هذه الحكم استشارات طبية، نفسية، أو مالية ملزمة.'}
              </p>

              <h4 className="text-base font-semibold text-white">
                {isEn ? '2. Attribution & Translations' : '2. دقة المحتوى ونسب الأقوال'}
              </h4>
              <p>
                {isEn
                  ? 'We endeavor to accurately attribute timeless sayings to their historical thinkers. Given multiple linguistic variations and centuries of oral and written transmission, slight wording nuances may exist across translations.'
                  : 'نبذل قصارى جهدنا لتوثيق وتنسيق الاقتباسات بنسبها لأصحابها بدقة. بعض الأقوال التاريخية قد تختلف صياغاتها عبر الترجمات المتعددة بين اللغات والحقب التاريخية.'}
              </p>

              <h4 className="text-base font-semibold text-white">
                {isEn ? '3. Independent Cognitive Sovereignty' : '3. استقلالية الاستنتاج'}
              </h4>
              <p>
                {isEn
                  ? 'Readers retain full intellectual sovereignty in interpreting and applying ideas to their personal and professional lives in accordance with their independent judgment.'
                  : 'يتحمل القارئ المسؤولية الكاملة عن كيفية تفسيره للأفكار وتطبيقها في واقعه الحياتي بما يلائم ظروفه وتوجهاته المستقلة.'}
              </p>
            </div>
          )}

          {activeModal === 'cookies' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-200 text-xs flex items-center gap-3">
                <Database className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  {isEn
                    ? 'Technical Transparency: We rely exclusively on zero-tracking client-side Local Storage for instant speed.'
                    : 'الشفافية التقنية: نعتمد التخزين المحلي النظيف (Local Storage) لضمان تجربة مستخدم فورية وفائقة السرعة.'}
                </span>
              </div>

              <h4 className="text-base font-semibold text-white">
                {isEn ? '1. Zero Tracker Cookies' : '1. ما هي ملفات الكوكيز في هذه المنصة؟'}
              </h4>
              <p>
                {isEn
                  ? 'We do not employ tracking beacons, ad-tech cookies, or behavioral telemetry. The application is completely ad-free and surveillance-free.'
                  : 'لا نستخدم أي ملفات تعريف ارتباط تجارية خبيثة أو ملفات تتبع إعلاني لجهات خارجية. المنصة خالية 100% من متتبعات التسوق المزعجة.'}
              </p>

              <h4 className="text-base font-semibold text-white">
                {isEn ? '2. LocalStorage Key Functions' : '2. آلية التخزين المحلي (Local Storage)'}
              </h4>
              <p>
                {isEn
                  ? 'We utilize client storage solely for functional user convenience:'
                  : 'نستخدم وحدات التخزين المؤقت المحلي للأغراض الوظيفية الأساسية فقط:'}
              </p>
              <ul className={`list-disc list-inside space-y-1.5 text-slate-300 ${isEn ? 'pl-2' : 'pr-2'}`}>
                <li>{isEn ? 'Remembering your bookmarked favorite quotes.' : 'حفظ قائمة الاقتباسات المفضلة التي قمت بتمييزها.'}</li>
                <li>{isEn ? 'Preserving your personal Reflections Vault entries across sessions.' : 'حفظ سجل تأملاتك وملاحظاتك الشخصية لتبقى متاحة لك في كل زيارة.'}</li>
                <li>{isEn ? 'Storing your sound volume, male voice selection, and language preference.' : 'تفضيلات الصوت والمظهر وحالة التبديل بين الفئات واللغة.'}</li>
              </ul>

              <h4 className="text-base font-semibold text-white">
                {isEn ? '3. Resetting & Purging Data' : '3. كيفية مسح البيانات'}
              </h4>
              <p>
                {isEn
                  ? 'You can flush all stored data at any point via your browser settings or directly via the "Clear All" action in the Reflections Vault.'
                  : 'يمكنك مسح هذه البيانات في أي وقت بسهولة من خلال إعدادات المتصفح الخاص بك (مسح بيانات الموقع المخزنة محلياً) أو من خلال زر إعادة التعيين في قسم التأملات.'}
              </p>
            </div>
          )}

          {activeModal === 'founder' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/50 to-purple-950/50 border border-cyan-500/30 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                  <UserCheck className="w-7 h-7 text-cyan-300" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Taha setri</h4>
                  <p className="text-cyan-400 text-xs font-future">FOUNDER & CYBERNETIC VISIONARY</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {isEn
                      ? 'Creator and Architect of Cyber Brain Games & Cyber Wisdom Vault Ecosystem'
                      : 'مؤسس ومصمم منظومة ألعاب العقل وخزنة الحكمة المستقبلية'}
                  </p>
                </div>
              </div>

              <p>
                {isEn
                  ? 'Conceived and architected by Taha setri, this platform serves as an aesthetic and intellectual bridge marrying cutting-edge cybernetic interface design with humanity’s deepest philosophical heritage.'
                  : 'انطلقت هذه المنظومة تحت إشراف وتصميم Taha setri لتكون جسراً معرفياً يدمج بين أرقى تصاميم الواجهات المستقبلية الرقمية (Cyberpunk & Ambient Aesthetics) وبين الصفاء الروحي والحكمة الإنسانية الخالدة.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href="https://cyber-brain-games.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>{isEn ? 'Cyber Brain Games' : 'ألعاب العقل السيبراني'}</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 group-hover:underline">
                    {isEn ? 'Explore Project ↗' : 'زيارة المشروع ↗'}
                  </span>
                </a>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isEn ? 'Vision: Mindful Cognitive Evolution' : 'الرؤية: وعي مستقبلي متجدد'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-future">CYBER WISDOM VAULT • Taha setri</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

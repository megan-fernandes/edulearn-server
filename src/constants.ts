import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

export const baseRoute = `/api/${process.env.VERSION}`;
export const port = process.env.PORT ?? 3000;

export const courseBasePath = "/course/:courseId";
export const chapterBasePath = "/chapter/:chapterId";

export enum Role {
  admin,
  instructor,
  student,
}

export enum courseLevels {
  beginner,
  intermediate,
  expert,
  all,
}

export enum lectureType {
  video,
  pdf,
  article,
  url,
}

export const salt = bcrypt.genSaltSync(10);

export const refreshTokenExpiry = "30d";

export const accessTokenExpiry = "1h";

export const resetPasswordLinkExp = Date.now() + 3600000; //now + 1h(3600000 ms)

export const image_max_file_size: number = 2 * 1024 * 1024; //2 MB

export const max_file_size: number = 10 * 1024 * 1024; //10 MB

export const validFileFormat: string[] = [
  "pdf",
  "odt",
  "docx",
  "pptx",
  "odp",
  "png",
  "jpeg",
  "jpg",
  "mp4",
  "mov",
  "avi",
  "webm",
  "hevc",
];

export const validImageFormat: Array<string> = [
  "png",
  "jpeg",
  "jpg",
  "heif",
  "heic",
  "raw",
  "svg+xml",
  "svg",
  "webp",
];

export const bucketUrl = process.env.BUCKET_URL as string;

//CORS config
export const allowedOrigins: string[] = [
  `http://localhost:3000`,
  `http://localhost:5173`,
  `http://172.30.232.130:3000`,
  `http://192.168.226.180:3000`,
  "https://api.stripe.com",
];

//endpoint secrets stripe

export const paymentSuccessKey = "whsec_PbVNvmhAnf9PfAOUGhMO9A5Z7k9zIFht";

export const paymentObj = {
  id: "cs_test_a1eMF942d9oG6nyxZfAK2mF3wdzntAa7epWxJ69jgZuxEoUmqPt8IsSbbx",
  object: "checkout.session",
  adaptive_pricing: { enabled: true },
  after_expiration: null,
  allow_promotion_codes: null,
  amount_subtotal: 39900,
  amount_total: 39900,
  automatic_tax: {
    enabled: false,
    liability: null,
    provider: null,
    status: null,
  },
  billing_address_collection: null,
  cancel_url: "http://localhost:5173/courses/686645365f661b587987d60b",
  client_reference_id: null,
  client_secret: null,
  collected_information: null,
  consent: null,
  consent_collection: null,
  created: 1751624375,
  currency: "usd",
  currency_conversion: null,
  custom_fields: [],
  custom_text: {
    after_submit: null,
    shipping_address: null,
    submit: null,
    terms_of_service_acceptance: null,
  },
  customer: null,
  customer_creation: "if_required",
  customer_details: {
    address: {
      city: null,
      country: "IN",
      line1: null,
      line2: null,
      postal_code: null,
      state: null,
    },
    email: "megan.fernandes1710@gmail.com",
    name: "Test Kumar",
    phone: null,
    tax_exempt: "none",
    tax_ids: [],
  },
  customer_email: null,
  discounts: [],
  expires_at: 1751710775,
  invoice: null,
  invoice_creation: {
    enabled: false,
    invoice_data: {
      account_tax_ids: null,
      custom_fields: null,
      description: null,
      footer: null,
      issuer: null,
      metadata: {},
      rendering_options: null,
    },
  },
  livemode: false,
  locale: null,
  metadata: {},
  mode: "payment",
  origin_context: null,
  payment_intent: "pi_3Rh6jx4aqQMiCYy707Hffp57",
  payment_link: null,
  payment_method_collection: "if_required",
  payment_method_configuration_details: null,
  payment_method_options: { card: { request_three_d_secure: "automatic" } },
  payment_method_types: ["card"],
  payment_status: "paid",
  permissions: null,
  phone_number_collection: { enabled: false },
  presentment_details: {
    presentment_amount: 3543706,
    presentment_currency: "inr",
  },
  recovered_from: null,
  saved_payment_method_options: null,
  setup_intent: null,
  shipping_address_collection: null,
  shipping_cost: null,
  shipping_options: [],
  status: "complete",
  submit_type: null,
  subscription: null,
  success_url: "http://localhost:5173/courses/686645365f661b587987d60b",
  total_details: { amount_discount: 0, amount_shipping: 0, amount_tax: 0 },
  ui_mode: "hosted",
  url: null,
  wallet_options: null,
};

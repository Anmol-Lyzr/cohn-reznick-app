import { NextRequest, NextResponse } from "next/server";
import clientPromise, { dbName } from "@/lib/mongodb";

const COLLECTION = "analyses";

export async function GET() {
  try {
    const client = await clientPromise;
    const docs = await client
      .db(dbName)
      .collection(COLLECTION)
      .find({}, { projection: { result: 0 } })
      .sort({ created_at: -1 })
      .toArray();
    return NextResponse.json(docs.map(d => ({ ...d, _id: d._id.toString() })));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { result, uploaded_files } = await req.json();
    const client = await clientPromise;
    const doc = {
      created_at: new Date(),
      period_range: result.data_summary?.period_range ?? "",
      files_ingested: result.data_summary?.files_ingested ?? [],
      uploaded_files: uploaded_files ?? [],
      total_months: result.data_summary?.total_months ?? 0,
      accounts_processed: result.data_summary?.accounts_processed ?? 0,
      anomaly_count: result.anomaly_findings?.length ?? 0,
      issue_count: result.issue_tracker?.length ?? 0,
      result,
    };
    const inserted = await client.db(dbName).collection(COLLECTION).insertOne(doc);
    return NextResponse.json({ id: inserted.insertedId.toString() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

package com.example.qc.utils

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Environment
import android.util.Log
import com.itextpdf.kernel.pdf.PdfDocument
import com.itextpdf.kernel.pdf.PdfWriter
import com.itextpdf.layout.Document
import com.itextpdf.layout.element.*
import com.itextpdf.layout.properties.*
import com.itextpdf.io.image.ImageDataFactory
import com.itextpdf.kernel.colors.ColorConstants
import com.itextpdf.kernel.colors.DeviceRgb
import com.itextpdf.layout.borders.SolidBorder
import com.example.qc.data.Constants
import com.example.qc.data.InspectionData
import com.example.qc.data.ObservationStatus
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

class PdfGenerator(private val context: Context) {
    
    suspend fun generateInspectionReport(inspection: InspectionData): String? = withContext(Dispatchers.IO) {
        try {
            Log.d("PdfGenerator", "Starting PDF generation...")
            Log.d("PdfGenerator", "Received inspection data:")
            Log.d("PdfGenerator", "- ID: ${inspection.id}")
            Log.d("PdfGenerator", "- General Info: ${inspection.generalInfo}")
            Log.d("PdfGenerator", "- Observations: ${inspection.observations.size}")
            Log.d("PdfGenerator", "- Extra Observations: ${inspection.extraObservations.values.flatten().size}")
            Log.d("PdfGenerator", "- Section Images: ${inspection.sectionImages.values.flatten().size}")

            val fileName = "inspection_${SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())}.pdf"
            val documentsDir = context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS)
            documentsDir?.mkdirs()
            val pdfFile = File(documentsDir, fileName)

            Log.d("PdfGenerator", "PDF will be saved to: ${pdfFile.absolutePath}")

            val writer = PdfWriter(FileOutputStream(pdfFile))
            val pdfDocument = PdfDocument(writer)
            val document = Document(pdfDocument)
            
            // Title
            val inspectionType = inspection.generalInfo["Inspection Type"] ?: "Equipment"
            document.add(
                Paragraph("$inspectionType Inspection Report")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(18f)
                    .setBold()
                    .setMarginBottom(20f)
            )
            
            // General Information
            addGeneralInfo(document, inspection)
            
            // Observation Summary
            addObservationSummary(document, inspection)
            
            // Section Details
            addSectionDetails(document, inspection)

            // Add overall AI summary if available
            val overallSummary = inspection.generalInfo["Overall Summary"]
            if (!overallSummary.isNullOrBlank()) {
                addOverallSummary(document, overallSummary)
            }

            // Add follow-up information
            addFollowUpInformation(document, inspection)

            document.close()
            Log.d("PdfGenerator", "PDF generated successfully: ${pdfFile.absolutePath}")
            pdfFile.absolutePath

        } catch (e: Exception) {
            Log.e("PdfGenerator", "Error generating PDF", e)
            e.printStackTrace()
            null
        }
    }
    
    private fun addGeneralInfo(document: Document, inspection: InspectionData) {
        document.add(
            Paragraph("General Information")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(14f)
                .setBold()
                .setMarginTop(10f)
                .setMarginBottom(10f)
        )
        
        Constants.INFO_FIELDS.forEach { field ->
            val value = inspection.generalInfo[field] ?: ""
            if (value.isNotBlank()) {
                document.add(
                    Paragraph("$field: $value")
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontSize(10f)
                        .setMarginBottom(5f)
                )
            }
        }
    }
    
    private fun addObservationSummary(document: Document, inspection: InspectionData) {
        document.add(
            Paragraph("Observations Summary")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(14f)
                .setBold()
                .setMarginTop(20f)
                .setMarginBottom(10f)
        )
        
        val statusCounts = inspection.getStatusCounts()
        ObservationStatus.values().forEach { status ->
            if (status != ObservationStatus.NA) {
                val count = statusCounts[status] ?: 0
                val color = when (status) {
                    ObservationStatus.PASS -> DeviceRgb(102, 204, 51)
                    ObservationStatus.MINOR -> DeviceRgb(230, 209, 65)
                    ObservationStatus.MAJOR -> DeviceRgb(255, 64, 64)
                    else -> DeviceRgb(136, 136, 136)
                }
                document.add(
                    Paragraph("${status.displayName}: $count")
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontSize(10f)
                        .setFontColor(color)
                        .setMarginBottom(5f)
                )
            }
        }
    }
    
    private fun addSectionDetails(document: Document, inspection: InspectionData) {
        Log.d("PdfGenerator", "Adding section details...")
        Constants.INSPECTION_SECTIONS.forEach { section ->
            Log.d("PdfGenerator", "Processing section: ${section.name}")

            // Section Separator Line
            document.add(
                Paragraph("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(8f)
                    .setMarginTop(15f)
                    .setMarginBottom(10f)
            )

            // Section Header
            document.add(
                Paragraph(section.name)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(14f)
                    .setBold()
                    .setMarginTop(10f)
                    .setMarginBottom(10f)
                    .setBackgroundColor(DeviceRgb(240, 240, 240))
                    .setPadding(5f)
            )
            
            // Observations
            section.observations.forEach { observationName ->
                if (observationName != "Extra Observations") {
                    val key = "${section.name}_$observationName"
                    val observation = inspection.observations[key]
                    Log.d("PdfGenerator", "Checking observation $key: status=${observation?.status}, images=${observation?.images?.size}")

                    if (observation?.status != null && observation.status != ObservationStatus.NA) {
                        Log.d("PdfGenerator", "Adding observation to PDF: $key")
                        val color = when (observation.status) {
                            ObservationStatus.PASS -> DeviceRgb(102, 204, 51)
                            ObservationStatus.MINOR -> DeviceRgb(230, 209, 65)
                            ObservationStatus.MAJOR -> DeviceRgb(255, 64, 64)
                            else -> DeviceRgb(136, 136, 136)
                        }
                        
                        // Observation status
                        document.add(
                            Paragraph("${observation.status.displayName}: $observationName")
                                .setTextAlignment(TextAlignment.CENTER)
                                .setFontSize(10f)
                                .setFontColor(color)
                                .setMarginBottom(5f)
                        )
                        
                        // Notes in a box
                        if (observation.notes.isNotBlank()) {
                            val noteDiv = Div()
                                .setBorder(SolidBorder(ColorConstants.GRAY, 1f))
                                .setBackgroundColor(DeviceRgb(250, 250, 250))
                                .setPadding(8f)
                                .setMarginBottom(10f)

                            noteDiv.add(
                                Paragraph("Notes:")
                                    .setFontSize(9f)
                                    .setBold()
                                    .setMarginBottom(3f)
                            )

                            noteDiv.add(
                                Paragraph(observation.notes)
                                    .setFontSize(9f)
                                    .setTextAlignment(TextAlignment.LEFT)
                            )

                            document.add(noteDiv)
                        }
                        
                        // Images in a grid layout
                        if (observation.images.isNotEmpty()) {
                            addImagesGrid(document, observation.images)
                        }
                    }
                }
            }
            
            // Extra Observations
            val extraObservations = inspection.extraObservations[section.name] ?: emptyList()
            extraObservations.forEach { extraObs ->
                if (extraObs.status != null && extraObs.status != ObservationStatus.NA) {
                    val color = when (extraObs.status) {
                        ObservationStatus.PASS -> DeviceRgb(102, 204, 51)
                        ObservationStatus.MINOR -> DeviceRgb(230, 209, 65)
                        ObservationStatus.MAJOR -> DeviceRgb(255, 64, 64)
                        else -> DeviceRgb(136, 136, 136)
                    }
                    
                    document.add(
                        Paragraph("${extraObs.status.displayName}: ${extraObs.name}")
                            .setTextAlignment(TextAlignment.CENTER)
                            .setFontSize(10f)
                            .setFontColor(color)
                            .setMarginBottom(5f)
                    )
                    
                    if (extraObs.notes.isNotBlank()) {
                        document.add(
                            Paragraph("Note: ${extraObs.notes}")
                                .setTextAlignment(TextAlignment.CENTER)
                                .setFontSize(10f)
                                .setMarginBottom(5f)
                        )
                    }
                    
                    extraObs.images.forEach { imagePath ->
                        try {
                            addImageToPdf(document, imagePath)
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }
                }
            }
            
            // Section Images
            val sectionImages = inspection.sectionImages[section.name] ?: emptyList()
            sectionImages.forEach { imagePath ->
                try {
                    addImageToPdf(document, imagePath)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            
            // Section Notes
            val sectionNote = inspection.sectionNotes[section.name]
            if (!sectionNote.isNullOrBlank()) {
                document.add(
                    Paragraph("Section Notes: $sectionNote")
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontSize(10f)
                        .setMarginTop(10f)
                        .setMarginBottom(10f)
                )
            }
        }
    }
    
    private fun addImagesGrid(document: Document, imagePaths: List<String>) {
        try {
            val validImages = imagePaths.filter { File(it).exists() }
            if (validImages.isEmpty()) return

            // Create table for image grid (3 columns for smaller images)
            val table = Table(3)
            table.setWidth(UnitValue.createPercentValue(100f))
            table.setMarginBottom(10f)

            validImages.chunked(3).forEach { rowImages ->
                rowImages.forEach { imagePath ->
                    val cell = Cell()
                    cell.setPadding(5f)

                    try {
                        val bitmap = BitmapFactory.decodeFile(imagePath)
                        // Better compression for PDF thumbnails
                        val stream = ByteArrayOutputStream()
                        bitmap.compress(Bitmap.CompressFormat.JPEG, 60, stream)
                        val imageData = ImageDataFactory.create(stream.toByteArray())
                        val image = Image(imageData)

                        // Much smaller grid images - about 25% of cell width
                        // This makes them small thumbnails like Python app
                        image.setWidth(UnitValue.createPercentValue(25f))
                        image.setHorizontalAlignment(HorizontalAlignment.CENTER)

                        cell.add(image)
                        bitmap.recycle()
                    } catch (e: Exception) {
                        cell.add(Paragraph("Image not available").setFontSize(8f))
                    }

                    table.addCell(cell)
                }

                // Fill remaining cells for 3-column table
                val remainingCells = 3 - rowImages.size
                repeat(remainingCells) {
                    table.addCell(Cell())
                }
            }

            document.add(table)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun addImageToPdf(document: Document, imagePath: String) {
        try {
            val imageFile = File(imagePath)
            if (imageFile.exists()) {
                val bitmap = BitmapFactory.decodeFile(imagePath)
                val stream = ByteArrayOutputStream()
                bitmap.compress(Bitmap.CompressFormat.JPEG, 60, stream)
                val imageData = ImageDataFactory.create(stream.toByteArray())
                val image = Image(imageData)

                // Much smaller images like Python app - about 10% of page width max
                // Python app max_width = 120 points, but we want even smaller
                val maxWidthPoints = 80f  // Smaller than Python app
                val pageWidthPoints = 612f
                val widthPercent = (maxWidthPoints / pageWidthPoints) * 100f // ~13%

                image.setWidth(UnitValue.createPercentValue(widthPercent))
                image.setHorizontalAlignment(HorizontalAlignment.CENTER)
                image.setMarginBottom(10f)

                document.add(image)
                bitmap.recycle()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun addOverallSummary(document: Document, summary: String) {
        // Section Separator Line
        document.add(
            Paragraph("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(8f)
                .setMarginTop(20f)
                .setMarginBottom(10f)
        )

        // Overall Summary Header
        document.add(
            Paragraph("OVERALL TURBINE SUMMARY")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(16f)
                .setBold()
                .setMarginTop(10f)
                .setMarginBottom(15f)
                .setBackgroundColor(DeviceRgb(220, 220, 220))
                .setPadding(8f)
        )

        // Summary content in a box
        val summaryDiv = Div()
            .setBorder(SolidBorder(ColorConstants.DARK_GRAY, 2f))
            .setBackgroundColor(DeviceRgb(248, 248, 248))
            .setPadding(12f)
            .setMarginBottom(15f)

        summaryDiv.add(
            Paragraph(summary)
                .setFontSize(11f)
                .setTextAlignment(TextAlignment.LEFT)
                .setMarginBottom(0f)
        )

        document.add(summaryDiv)
    }

    private fun addFollowUpInformation(document: Document, inspection: InspectionData) {
        // Section Separator Line
        document.add(
            Paragraph("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(8f)
                .setMarginTop(20f)
                .setMarginBottom(10f)
        )

        // Follow-up Header
        document.add(
            Paragraph("FOLLOW-UP REQUIREMENTS")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(16f)
                .setBold()
                .setMarginTop(10f)
                .setMarginBottom(15f)
                .setBackgroundColor(DeviceRgb(255, 255, 200))
                .setPadding(8f)
        )

        // Follow-up content
        val followUpDiv = Div()
            .setBorder(SolidBorder(ColorConstants.DARK_GRAY, 2f))
            .setBackgroundColor(DeviceRgb(255, 255, 240))
            .setPadding(12f)
            .setMarginBottom(15f)

        // Overall follow-up date
        if (inspection.overallFollowUpDate.isNotBlank()) {
            followUpDiv.add(
                Paragraph("📅 NEXT INSPECTION DATE: ${formatFollowUpDate(inspection.overallFollowUpDate)}")
                    .setFontSize(12f)
                    .setBold()
                    .setMarginBottom(8f)
            )
        }

        // Follow-up priority
        if (inspection.followUpPriority.isNotBlank()) {
            followUpDiv.add(
                Paragraph("⚠️ PRIORITY LEVEL: ${inspection.followUpPriority}")
                    .setFontSize(11f)
                    .setBold()
                    .setMarginBottom(10f)
            )
        }

        // Individual observation follow-ups
        val observationsWithFollowUp = inspection.observations.values.filter {
            !it.followUpDate.isNullOrBlank() && it.status in listOf(ObservationStatus.MAJOR, ObservationStatus.MINOR)
        }

        if (observationsWithFollowUp.isNotEmpty()) {
            followUpDiv.add(
                Paragraph("SPECIFIC OBSERVATION FOLLOW-UPS:")
                    .setFontSize(11f)
                    .setBold()
                    .setMarginBottom(5f)
            )

            observationsWithFollowUp.forEach { obs ->
                val statusIcon = when (obs.status) {
                    ObservationStatus.MAJOR -> "🚨"
                    ObservationStatus.MINOR -> "⚠️"
                    else -> "•"
                }

                followUpDiv.add(
                    Paragraph("$statusIcon ${obs.sectionName} - ${obs.observationName}: ${formatFollowUpDate(obs.followUpDate!!)}")
                        .setFontSize(10f)
                        .setMarginBottom(3f)
                        .setMarginLeft(10f)
                )
            }
        }

        // Extra observations follow-ups
        val extraObsWithFollowUp = inspection.extraObservations.values.flatten().filter {
            !it.followUpDate.isNullOrBlank() && it.status in listOf(ObservationStatus.MAJOR, ObservationStatus.MINOR)
        }

        if (extraObsWithFollowUp.isNotEmpty()) {
            followUpDiv.add(
                Paragraph("ADDITIONAL OBSERVATION FOLLOW-UPS:")
                    .setFontSize(11f)
                    .setBold()
                    .setMarginTop(10f)
                    .setMarginBottom(5f)
            )

            extraObsWithFollowUp.forEach { extraObs ->
                val statusIcon = when (extraObs.status) {
                    ObservationStatus.MAJOR -> "🚨"
                    ObservationStatus.MINOR -> "⚠️"
                    else -> "•"
                }

                followUpDiv.add(
                    Paragraph("$statusIcon ${extraObs.name}: ${formatFollowUpDate(extraObs.followUpDate!!)}")
                        .setFontSize(10f)
                        .setMarginBottom(3f)
                        .setMarginLeft(10f)
                )
            }
        }

        document.add(followUpDiv)
    }

    private fun formatFollowUpDate(dateString: String): String {
        return try {
            val date = java.time.LocalDate.parse(dateString)
            date.format(java.time.format.DateTimeFormatter.ofPattern("MMMM dd, yyyy"))
        } catch (e: Exception) {
            dateString
        }
    }
}
